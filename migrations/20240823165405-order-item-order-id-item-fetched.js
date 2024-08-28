'use strict';

const { DataTypes } = require('sequelize-cockroachdb');

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OrderItems', 'AmazonOrderId', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('OrderItems', 'itemFetched', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OrderItems', 'AmazonOrderId');
    await queryInterface.removeColumn('OrderItems', 'itemFetched');
  }
};
