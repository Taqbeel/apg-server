'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Define the data you want to upsert
    const tokensData = [
      {
        access_token: 'AT1',
        refresh_token: 'Atzr|IwEBIB7iiIr5QrliqAJm6Df5FsnXugaZre-6gUUgsmJH3iSGmxVjGnsFvHcz7SzKmRK9rjS6zLDtHVbuTfZQLtjwMzXk6SftSnDxiQ0fQYFwO_RxgtjUy1ZcjdCzxIyxe9pk6eGSJNZUF5DgF7_XhOH53ISRPcQhtuzykPm7JEnm-K7-sWBUkjG9jxTEUqU9Y6S3TFNp2QBPUtvbBzJnv6JB_zn2cvy7rQuSIke2Iqjfp74Su9DjuExE3__Yb3c3IvWgBcGiGq4IjxdVbkH5ugoJUyDamw0mHiI8TbawWenym_x5zy9yPXzhXKMmMZKiGZ8YmoA',
        vendorName: 'HIGH END FASHION',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        access_token: 'AT2',
        refresh_token: 'Atzr|IwEBIFOIy0Yt5LESFBFCFHVVHkPBrsTpTyNjqD1xlHOJcsfm3PLnJ9fd2wJ3x5cJbsV1rxiO1RTnncG5V0QmVFfvhouxxoOVeqkC27YDsN7MWjKYuj9F04pqrtoLgRI4p1Mn4BrCQ6KIy_r4ELiEhtXPn-0FVrP6_4XtFgHGU7nmy2o0D9lT8SeABiK1BdzlLupAMtCjaVNNsOrwS_cBJQeC-S7yQqNQeUm3PGrSlDoVQE3GmsfZzlvO8XYsa9UlZvzh4UlUfODT9IjsWPM-hpDn5W7mlN7NjnHMGbMMyKXUbSGfydVmmvKx_EvUhEAqSJsZYkk',
        vendorName: 'Hejaz NJ',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        access_token: 'AT3',
        refresh_token: 'Atzr|IwEBIDejOsvlpma-YU0lx5GdJLNRd3CnJpZU6LKs14FvJSMHqaABqzuiHxZ_AEv01x5QAbRfqDShVSvfBVqzSnkMc5-QQ6wlF37qVNCAzkXHVg1pb7RMMD8BR9RdR7gAVcGhC020LDfGc0OOVDdYFSeQauCZ-WQGVyQ27Fmv9dSTiVi8_n1B6MKyNb9tb5pnaE_78KhQXEVoIELDxhGOr_4tD0SFzAIh4IDW5wrBm6LIEw4mYfLxGRAjYZQPDUL1KAFr4QzAN29SCbNEN__YyqGL3U6OQpbjDygR3AsDy0IIOsEKEQlEqYRpdKCnRHJZttBdyCk',
        vendorName: 'Five Pillar NJ',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        access_token: 'AT4',
        refresh_token: 'Atzr|IwEBIAlT7ZIClc1Cbds5AxX_29x-Kw9tLJj-OiwMBztZTmfC15gF-IQrSfxfWgkL6SF92zcV9KJYEgLhDuyE9DCJ-OF5hSSdqOGF-3lGSRASuhD0uq0KbgHw2FMtytCybbmRTA_zCZbPB05SCTPg3I0H07XXbMcVpz2je7sZM8magZ-ipUnwNFZXTzpaQ8jp331Y_JE1XiK6eDMR6dL9Bg_i485LMjd6V43SWUweMo7ECc2zW080GLSnXpZeScURENkK3dLXmvHgzBaaPNzq3R6Gh0x6mHr4LInB5w8TdA9Fcg03vDyTBieFl0IW7A_Fk6mFPswTYfaQLeITB5bOyBbxRlx7',
        vendorName: 'Shipping Guru LLC',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // await queryInterface.bulkInsert('Tokens', tokensData, {});
    for (const token of tokensData) {
      await queryInterface.sequelize.query(
        `
        INSERT INTO "Tokens" ("access_token", "refresh_token", "vendorName", "createdAt", "updatedAt")
        VALUES (:access_token, :refresh_token, :vendorName, :createdAt, :updatedAt)
        ON CONFLICT ("refresh_token") 
        DO UPDATE SET 
          "refresh_token" = EXCLUDED."refresh_token", 
          "updatedAt" = EXCLUDED."updatedAt";
        `,
        {
          replacements: token,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Add reverting commands here, if needed
    await queryInterface.bulkDelete('Tokens', null, {});
  },
};
