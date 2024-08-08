const db = require("../models");
const { Orders, OrderItems, OrderShipment } = require("../associations/orderAssociations")
const updateOrders = require("../services/updateOrders")
const { Op } = require('sequelize');
const updateManualOrders = require("../services/updateManualOrders")


exports.updateOrders = (req, res) => {
  updateOrders();
  return res.json({
    status: "done"
  });
};

exports.getOrders = (req, res) => {
  db.Orders.findAll({
    where: {
      [Op.or]: [{ OrderStatus: 'Shipped' }, { OrderStatus: 'Unshipped' }],
    },
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