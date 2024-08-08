const routes = require('express').Router();
const shippingController = require("../../controllers/shipping.controllers");

// fetch Rates for Shipping
routes.post("/getRates", shippingController.fetchRates);

// Buy Shipping
routes.post("/purchaseShipment", shippingController.purchaseShipment);

// Get Label
routes.post("/getLabel", shippingController.getLabel);

module.exports = routes;