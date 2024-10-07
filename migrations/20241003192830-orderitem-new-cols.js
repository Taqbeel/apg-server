module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('OrderItems', 'trackingNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('OrderItems', 'expectedDelivery', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('OrderItems', 'poNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('OrderItems', 'trackingNumber');
    await queryInterface.removeColumn('OrderItems', 'expectedDelivery');
    await queryInterface.removeColumn('OrderItems', 'poNumber');
  }
};