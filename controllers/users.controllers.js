const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const db = require("../models");

const Op = Sequelize.Op;

exports.getOperationUsers = async (req, res) => {
  try {
    const result = await db.Users.findAll({
      where: { type: 'operations' }
    });
    res.json({
      status: 'success',
      result
    })
  } catch (error) {
    res.json({
      status: 'error'
    })
  }
};