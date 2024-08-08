const routes = require('express').Router();
const userController = require("../../controllers/users.controllers");

// Dashboard User Login / Signin
routes.get("/getOperationUsers", userController.getOperationUsers);

module.exports = routes;