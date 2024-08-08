const db = require("../models");
const { Orders, OrderItems, OrderShipment } = require("../associations/orderAssociations");
const { AlbPurchaseOrder, PoItems, AlbPoCompleted, AlbShippingBox } = require("../associations/poAssociations");
const axios = require("axios");
const { Op } = require('sequelize');

exports.getPo = (req, res) => {
  AlbPoCompleted.findAll({
    order: [['createdAt', 'DESC']],
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

exports.getShippingBox = (req, res) => {
  AlbShippingBox.findAll({
    where:{
      AlbPoCompletedId:req.headers.id
    }
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

exports.getPoData = (req, res) => {
  AlbShippingBox.findAll({
    include:[{
      model:AlbPoCompleted,
      attributes:['customerpo']
    }]
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