const db = require("../models");
const { Orders, OrderItems, OrderShipment } = require("../associations/orderAssociations")
const updateOrders = require("../services/updateOrders")
// const updateOrders1 = require("../services/updateOrders-1")
// const updateOrders2 = require("../services/updateOrders-2")
// const updateOrders3 = require("../services/updateOrders-3")
const { Op } = require('sequelize');
const updateManualOrders = require("../services/updateManualOrders");
const { processOrders, fetchInventory } = require("../services/vnOrders");


exports.updateOrders = (req, res) => {
  updateOrders();
  // updateOrders1();
  // updateOrders2();
  // updateOrders3();
  return res.json({
    status: "done"
  });
};

exports.processOrders = async (req, res) => {
  await processOrders();
  return res.json({
    status: "done"
  });
};

exports.fetchInventoryByPo = async (req, res) => {
  const { pONumber } = req.query;
  await fetchInventory(pONumber);
  return res.json({
    status: "done"
  });
};

exports.getOrders = (req, res) => {
  const { orderId, orderStatus, pONumber, vendorName } = req.query;


  let where = {};

  if (orderId) {
    where.AmazonOrderId = {
      [Op.like]: `%${orderId}%`
    };
  }
  if (pONumber) {
    where['$OrderItems.poNumber$'] = {
      [Op.iLike]: `%${pONumber}%`
    };
  }


  if (vendorName) {
    where.vendorName = {
      [Op.iLike]: `%${vendorName}%`
    };
  }

  if (orderStatus) {
    where.OrderStatus = {
      [Op.iLike]: `%${orderStatus}%`
    };
  } else {
    where.OrderStatus = {
      [Op.or]: ['Shipped', 'Unshipped'],
    };
  }

  db.Orders.findAll({
    where,
    include: [
      { model: OrderItems },
      {
        model: OrderShipment,
        attributes: ['promise']
      }
    ],
    order: [['PurchaseDate', 'DESC']],
  })
    .then((data) => {
      res.json({
        status: "success",
        result: data
      });
    }).catch((err) => {
      console.log(err)
      res.json({
        status: "error",
        message:
          err.message ||
          "Some error occurred while retrieving user.",
      });
    });
};

exports.getAlphaOrders = (req, res) => {
  db.Orders.findAll({
    where: {
      status: 'arriving',
    },
    include: [
      {
        model: OrderItems,
        where: {
          isAlpha: true
        }
      },
      {
        model: OrderShipment,
        attributes: ['promise']
      }
    ],
    order: [['PurchaseDate', 'DESC']],
  })
    .then((data) => {
      res.json({
        status: "success",
        result: data
      });
    }).catch((err) => {
      console.log(err)
      res.json({
        status: "error",
        message:
          err.message ||
          "Some error occurred while retrieving user.",
      });
    });
};

exports.getOrderByAPI = async (req, res) => {
  db.Orders.findOne({
    where: {
      AmazonOrderId: req.headers.id,
    },
    include: [{
      model: OrderItems
    }],
    order: [
      ['PurchaseDate', 'DESC']
    ],
  })
    .then((data) => {
      res.json({
        status: "success", result: data
      });
    }).catch((err) => {
      console.log(err)
      res.json({
        status: "error",
        message: err.message || "Some error occurred while retrieving user.",
      });
    });
};

exports.assignOrder = async (req, res) => {
  try {
    const result = await db.Orders.update({
      User: req.body.name
    }, {
      where: {
        id: req.body.id
      }
    }).catch((x) => {
      console.log(x)
    });
    res.json({
      status: "success", result
    })
  } catch (error) {
    res.json({
      status: "error"
    })
  }
};

exports.orderStatusChange = async (req, res) => {
  try {
    const { id, status } = req.body
    const result = await db.Orders.update({
      OrderStatus: status
    }, {
      where: { id }
    })

    if (result[0] === 0) {
      return res.json({ status: "error", message: "No rows were updated. Check if the order is already in 'Inprocess' state or if the id is correct." });
    }

    res.json({
      status: "success", result
    })
  } catch (error) {
    res.json({
      status: "error"
    })
  }
};

exports.uploadManualOrders = async (req, res) => {
  try {
    req.body.orders.forEach(order => {
      Orders.upsert({ ...order })
        .then((orderData) => {
          let tempOrderItems = order.OrderItems.map((orderItem) => {
            return {
              ...orderItem,
              OrderId: orderData[0].dataValues.id
            }
          });
          OrderItems.bulkCreate(tempOrderItems).catch((x) => console.log(x))
        }).catch((y) => console.log(y))
    });
    updateManualOrders()
    res.send("okay");
  } catch (error) {
    console.log(error)
    res.send(error.message)
  }
};