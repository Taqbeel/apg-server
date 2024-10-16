module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the expectedDelivery column from OrderItems
    await queryInterface.removeColumn('OrderItems', 'expectedDelivery');
  },

  down: async (queryInterface, Sequelize) => {
    // Re-add the expectedDelivery column to OrderItems (as a STRING)
    await queryInterface.addColumn('OrderItems', 'expectedDelivery', {
      type: Sequelize.STRING, // Using STRING instead of DATE
      allowNull: true
    });
  }
};
