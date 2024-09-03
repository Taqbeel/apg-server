'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const usersData = [
      {
        name: 'Farhan',
        username: 'farhan@apparelglobe.com',
        password: 'Lumia@520',
        type: 'admin',
        createdBy: 'admin',
        updatedBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // await queryInterface.bulkInsert('Users', usersData, {});  
    for (const user of usersData) {
      await queryInterface.sequelize.query(
        `
        INSERT INTO "Users" ("name", "username", "password", "type", "createdBy", "updatedBy", "createdAt", "updatedAt")
        VALUES (:name, :username, :password, :type, :createdBy, :updatedBy, :createdAt, :updatedAt)
        ON CONFLICT ("username") 
        DO UPDATE SET 
          "username" = EXCLUDED."username", 
          "updatedAt" = EXCLUDED."updatedAt";
        `,
        {
          replacements: user,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Add reverting commands here, if needed
    await queryInterface.bulkDelete('Users', null, {});
  },
};
