'use strict';

const { DataTypes } = require('sequelize-cockroachdb');

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('OrderItems', 'itemFetched', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('OrderItems', 'itemFetched', {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    });
  }
};
