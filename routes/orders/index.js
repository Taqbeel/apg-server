const routes = require("express").Router();
const ordersController = require("../../controllers/orders.controllers");

// updateOrders Unshipped Orders
routes.get("/updateOrders", ordersController.updateOrders);

// get Unshipped/Pending Orders
routes.get("/getOrders", ordersController.getOrders);

// get Unshipped/Pending Orders
routes.get("/getAlphaOrdersOrders", ordersController.getAlphaOrders);

// Get Order from Amazon API
routes.get("/getOrderByAPI", ordersController.getOrderByAPI);

// Assign Order to User
routes.post("/assignOrder", ordersController.assignOrder);

// Update order 
routes.post("/orderToProcess", ordersController.orderToProcess);

// updateOrders Unshipped Orders
routes.post("/uploadManualOrders", ordersController.uploadManualOrders);

module.exports = routes;