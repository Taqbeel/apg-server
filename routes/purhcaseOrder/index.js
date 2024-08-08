const routes = require('express').Router();
const poController = require("../../controllers/po.controllers");

// updateOrders Unshipped Orders
routes.get("/get", poController.getPo);

// updateOrders Unshipped Orders
routes.get("/getShippingBox", poController.getShippingBox);

// updateOrders Unshipped Orders
routes.get("/getPoData", poController.getPoData);

module.exports = routes;