const db = require("../models");
const { Users, Orders, OrderItems, OrderShipment } = require("../associations/orderAssociations")
const getRefreshToken = require("../services/getRefreshToken");
const axios = require("axios");
const { Op } = require('sequelize');
const { SELLING_URL, SELLING_URL_SB } = require("../config/config");

// const baseUrl = SELLING_URL_SB
const baseUrl = SELLING_URL

const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));

exports.fetchRates = async (req, res) => {

  const { vendorName, body } = req.body

  const tokenData = await getRefreshToken(vendorName);
  const data = JSON.stringify({
    ...body
  });

  const config = {
    method: 'post',
    url: baseUrl + '/shipping/v2/shipments/rates',
    headers: {
      'x-amz-access-token': tokenData?.dataValues?.access_token,
      'x-amzn-shipping-business-id': 'AmazonShipping_US',
      'Content-Type': 'application/json'
    },
    data: data
  };

  await axios(config)
    .then(function (response) {
      res.json({
        status: "success",
        result: JSON.stringify(response.data)
      });
    })
    .catch(function (error) {
      console.log(error.code);
      console.log(error.response?.data);
      res.json({ status: "error", result: error?.response?.data?.errors[0] });
    });

};

exports.purchaseShipment = async (req, res) => {
  const { vendorName, body } = req.body

  const tokenData = await getRefreshToken(vendorName);
  // const data = JSON.stringify({
  //   ...body
  // });

  const config = {
    method: 'post',
    url: baseUrl + '/shipping/v2/shipments',
    headers: {
      'x-amz-access-token': tokenData?.dataValues?.access_token,
      'x-amzn-shipping-business-id': 'AmazonShipping_US',
      'Content-Type': 'application/json'
    },
    data: body
  };

  await axios(config)
    .then(function (response) {
      Orders.update({
        shipmentBought: true
      }, {
        where: {
          id: req.body.OrderId
        }
      })
      OrderShipment.create({
        OrderId: req.body.OrderId,
        ...response.data.payload,
        totalCharge: response.data.payload?.totalCharge?.value,
        chargeUnit: response.data.payload?.totalCharge?.unit,
        trackingId: response.data.payload.packageDocumentDetails[0]?.trackingId,
        packageClientReferenceId: response.data.payload.packageDocumentDetails[0]?.packageClientReferenceId,
        document: response.data.payload.packageDocumentDetails[0]?.packageDocuments[0]?.contents,
        format: response.data.payload.packageDocumentDetails[0]?.packageDocuments[0]?.format,
      })
      res.json({
        status: "success",
        result: JSON.stringify(response.data)
      });
    })
    .catch(function (error) {
      console.log('Purchase shipment error', error?.response?.data);
      res.json({ status: "error", result: error?.response?.data?.errors[0] });
    });
};

exports.getLabel = async (req, res) => {

  await OrderShipment.findOne({
    // attributes: ['document', 'format'],
    where: {
      OrderId: req.body.id
    }
  }).then((responce) => {
    res.json({
      status: "success",
      result: responce
    });
  }).catch(function (error) {
    console.log(error.message);
    res.json({ status: "error", result: error });
  });

};