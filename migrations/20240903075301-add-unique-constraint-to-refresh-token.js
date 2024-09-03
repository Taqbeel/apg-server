'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Tokens', {
      fields: ['refresh_token'],
      type: 'unique',
      name: 'unique_refresh_token_constraint' // Custom name for the constraint
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Tokens', 'unique_refresh_token_constraint');
  }
};
