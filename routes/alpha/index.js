const routes = require('express').Router();
const alphaController = require("../../controllers/alpha.controllers");

// updateOrders Unshipped Orders
routes.get("/getInventory", alphaController.getInventory);

// updateOrders Unshipped Orders
routes.get("/getInventoryById", alphaController.getInventoryById);

// updateOrders Unshipped Orders
routes.get("/getInventoryByItemNumber", alphaController.getInventoryByItemNumber);

// updateOrders Unshipped Orders
routes.get("/createPo", alphaController.createPo);

module.exports = routes;