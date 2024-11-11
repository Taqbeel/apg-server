'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add expectedDelivery column as STRING in OrderItems
    await queryInterface.addColumn('OrderItems', 'itemColors', {
      type: Sequelize.STRING, // Using STRING instead of DATE
      allowNull: true
    });
    await queryInterface.addColumn('OrderItems', 'itemNumbers', {
      type: Sequelize.STRING, // Using STRING instead of DATE
      allowNull: true
    });
    await queryInterface.addColumn('OrderItems', 'itemSize', {
      type: Sequelize.STRING, // Using STRING instead of DATE
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the expectedDelivery column if needed
    await queryInterface.removeColumn('OrderItems', 'itemColors');
    await queryInterface.removeColumn('OrderItems', 'itemNumbers');
    await queryInterface.removeColumn('OrderItems', 'itemSize');
  }
};
