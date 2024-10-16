module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add expectedDelivery column as STRING in OrderItems
    await queryInterface.addColumn('OrderItems', 'expectedDelivery', {
      type: Sequelize.STRING, // Using STRING instead of DATE
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the expectedDelivery column if needed
    await queryInterface.removeColumn('OrderItems', 'expectedDelivery');
  }
};
