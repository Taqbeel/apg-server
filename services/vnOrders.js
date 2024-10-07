const axios = require('axios');
const { Op } = require('sequelize');
const { OrderItems } = require("../associations/orderAssociations");
const { getInventoryById } = require("../controllers/alpha.controllers");
const { ALPHA_BRODER_URL, ALPHA_USER, ALPHA_PASS } = require('../config/config');

const processOrders = async () => {
  try {
    // Fetch orders that do not start with 'bulk'
    const orders = await OrderItems.findAll({
      where: {
        SellerSKU: {
          [Op.notILike]: '%bulk%'
        },
        poNumber: null
      }
    });

    let batchTotal = 0;
    let batchOrders = [];

    for (const order of orders) {

      const orderPrice = order.dataValues.ItemPriceAmount + order.dataValues.TaxAmount;
      const orderValue = Number((orderPrice * order.dataValues.QuantityOrdered).toFixed(2));

      const currTotal = batchTotal + orderValue

      if (currTotal > 250) {
        continue
      }


      // Add order to the batch
      batchTotal += orderValue;
      batchOrders.push(order);

      // Check if batch total reaches $200
      if (batchTotal >= 200 && batchTotal <= 250) {
        // Place the order
        await placeOrder(batchOrders);
        batchTotal = 0;
        batchOrders = [];
      }
    }
  } catch (error) {
    console.error('Error processing orders:', error);
  }
};

const placeOrder = async (orders) => {
  try {
    // Prioritize orders based on warehouse
    // const prioritizedOrders = prioritizeWarehouses(orders);

    // console.log('orders', orders)
    // Generate a Purchase Order (PO) number
    const poNumber = generatePoNumber();

    await Promise.all(orders.map(order =>
      order.update({ poNumber })
    ));


    // let items = [];

    // await orders?.forEach((y) => {
    //   items.push({
    //     id: y.dataValues.id,
    //     itemNo: y.dataValues.SellerSKU
    //   });
    // });

    // await fetchInventory(items);

    // Place order using Alpha Broder API
    // const response = await axios.post(`${ALPHA_BRODER_URL}/placeOrder`, {
    //   userName: ALPHA_USER,
    //   password: ALPHA_PASS,
    //   orders: prioritizedOrders,
    //   poNumber
    // });

    // // Update orders with tracking information
    // await updateOrdersWithTracking(response.data);
  } catch (error) {
    console.error('Error placing order:', error);
  }
};

// const prioritizeWarehouses = (orders) => {
//   // Sort orders based on warehouse priority
//   const priorityMap = {
//     'PA': 1, 'MA': 1,
//     'Chicago': 2, 'Atlanta': 2, 'Florida': 2,
//     'Kansas': 3, 'Texas': 3,
//     'California': 4
//   };

//   return orders.sort((a, b) => {
//     return (priorityMap[a.warehouse] || 5) - (priorityMap[b.warehouse] || 5);
//   });
// };

const generatePoNumber = () => {
  // Generate a unique PO number
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// const updateOrdersWithTracking = async (trackingData) => {
//   // Update database with tracking number and expected delivery date
//   for (const data of trackingData) {
//     await OrderItems.update(
//       {
//         trackingNumber: data.trackingNumber,
//         expectedDelivery: data.deliveryDate
//       },
//       {
//         where: { id: data.orderId }
//       }
//     );
//   }
// };

const fetchInventory = async (poNumber) => {
  let tempInventory = [];
  let itemNos = []
  let count = 0;

  const orders = await OrderItems.findAll({
    where: { poNumber }
  });

  let list = [];

  await orders?.forEach((y) => {
    list.push({
      id: y.dataValues.id,
      itemNo: y.dataValues.SellerSKU
    });
  });

  console.log('items', list)
  
  await Promise.all(list.map((item) => {

     getInventoryById(
      {
        headers: {
          itemid: item.itemNo
        }
      }
    ).then((res) => {
      console.log('res', res)
      // if(res.data.status="success"){
      //   tempInventory.push(res.data);
      //   // res?.data?.itemNumbers.length>0 ? fetchAddtionalOrders(res?.data?.itemNumbers) : null;
      //   res?.data?.itemNumbers?.forEach((itmNo:string) => itemNos.push(itmNo))

      //   count = count + 1;
      //   if(count == list.length){
      //     globalItemsList = tempInventory
      //     fetchAddtionalOrders(itemNos)
      //   }
      // }
    })
  }));
};

module.exports = { processOrders, fetchInventory };