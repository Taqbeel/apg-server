module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the column type from DATE to STRING
    await queryInterface.changeColumn('OrderItems', 'expectedDelivery', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column type from STRING back to DATE
    await queryInterface.changeColumn('OrderItems', 'expectedDelivery', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
