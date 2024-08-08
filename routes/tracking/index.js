const routes = require('express').Router();
const trackingController = require("../../controllers/tracking.controllers");

// fetch Rates for Shipping
routes.get("/tracking", trackingController.tracking);

// fetch Rates for Shipping
routes.get("/bulkTracking", trackingController.bulkTracking);

module.exports = routes;