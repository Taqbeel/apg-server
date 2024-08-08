const axios = require('axios');
const db = require('../models');
const { Orders, OrderShipment } = require("../associations/orderAssociations");
const getRefreshToken = require("./getRefreshToken");
const { SELLING_URL } = require('../config/config');

const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));

const baseUrl = SELLING_URL

module.exports = fetchStatuses = async (list) => {

  const tokenData = await getRefreshToken();
  let ordersList = [];

  await list.forEach(async (x) => {
    if (x?.dataValues?.OrderShipment?.dataValues?.trackingId) {
      const config = {
        method: 'get',
        url: baseUrl + `/shipping/v2/tracking?trackingId=${x.dataValues.OrderShipment.dataValues.trackingId}&carrierId=USPS&`,
        headers: {
          'x-amz-access-token': tokenData?.dataValues?.access_token,
          'x-amzn-shipping-business-id': 'AmazonShipping_US',
          'Content-Type': 'application/json'
        }
      };
      await delay(1000);
      await axios(config)
        .then(function (response) {
          if (response?.data?.payload?.summary?.status == 'Delivered') {
            ordersList.push({
              id: x?.dataValues.id,
              status: 'delivered'
            });
            Orders.update({ status: 'delivered' }, { where: { id: x?.dataValues.id } })
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  });
};