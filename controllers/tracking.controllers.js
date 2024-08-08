const db = require("../models");
const { Orders, OrderShipment } = require("../associations/orderAssociations")
const getRefreshToken = require("../services/getRefreshToken");
const axios = require("axios");
const fetchStatuses = require("../services/fetchStatus");
const { SELLING_URL } = require("../config/config");

const baseUrl = SELLING_URL

exports.tracking = async (req, res) => {
  const tokenData = await getRefreshToken();
  const result = await Orders.findOne({
    where: {
      AmazonOrderId: req.headers.id
    },
    attributes: ['id'],
    include: [{
      model: OrderShipment,
    }]
  });
  const config = {
    method: 'get',
    url: baseUrl + `/shipping/v2/tracking?trackingId=${result.dataValues.OrderShipment.dataValues.trackingId}&carrierId=USPS&`,
    headers: {
      'x-amz-access-token': tokenData?.dataValues?.access_token,
      'x-amzn-shipping-business-id': 'AmazonShipping_US',
      'Content-Type': 'application/json'
    }
  };

  axios(config)
    .then(function (response) {
      res.json({
        status: "success",
        result: response.data.payload
      });
    })
    .catch(function (error) {
      console.log(error.code);
      res.json({ status: "error", result: JSON.stringify(error) });
    });
};

exports.bulkTracking = async (req, res) => {

  const result = await Orders.findAll({
    where: {
      status: 'transit'
    },
    attributes: ['id'],
    include: [
      {
        model: OrderShipment,
        attributes: ['trackingId']
      },
    ]
  });
  fetchStatuses(result);

  res.send("success");
};