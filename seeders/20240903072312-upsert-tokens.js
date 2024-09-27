'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Define the data you want to upsert
    const tokensData = [
      {
        access_token: 'AT1',
        refresh_token: 'Atzr|IwEBINzeMHt-wbbXSgaL2-wnkWJpAlO_K0vn0hOVt87X4yTNkCUA3FjVZd4cmQP5NtiyCn5WW2GsXShLEbmGv4yZ7HYbQJuBI3GVsMBupXmiWuBeqIiQ1XDz-_0cQeRfMKKKkbV1jqdHX1ZACRHHZNUnd22Gyj63EgDpRDPkEU5mcKuJjFL7iFvxnjqdR_G87SRhnG1wpbPv0aQXTxPo1OREdeYJS2CxtO2YZhSmS2z9RWWlxTQB4Q5a4HtPNLBvdN9RJKw6fJSz2ZbsjF8uBhCTpQa2obGzh7suTFFmBj-LNGGqiYGLEo60xdWrhodozvCNxmM',
        vendorName: 'HIGH END FASHION',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        access_token: 'AT2',
        refresh_token: 'Atzr|IwEBIAj1R2Xb34_LllstgtPcBfp75V1oatrUmmjk9StMy_bTVsWCM9wfTS02xJ5oVBIf0bGoZkz8aFFUEcE6Gv99-wWKggGjiouZQAJs89U5L_W8RefmnMIbUUA3mkm_WzhDtHykMTA_IrR8ACF2ln2ELqQkcKdaeQCk9oux--QMrqDhmZ-87f9PxcYIcwJXSxyn7yPAFu119AO1-sp_9TzRr_Z3CruMej2shJvVxIUIRuEHov6eUVvf5etJEiPAaFuinM_kHxHQLI-wJAdKNiCsOe3uHkf7CuXwxnHdgO_kBfSQH3jIpHs1oVQWJPBjfz4RcwY',
        vendorName: 'Hejaz NJ',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        access_token: 'AT3',
        refresh_token: 'Atzr|IwEBIGmIp92etaCSGk0LJKsWnTQVCPny-cCQJiNuvwaPvKIl9ocuXxaEGLYeweavcGAqvBsIBf7pjgGyEwYQZ8DdAe-No5ivizUeth5dfSLkCMp3A7sl6GX6vWU98yI-UaeIv51v0RuVgaC8TpcsL9Z7XXm_UqbRNkwM32VcNuj9sGRRruL15TygLR9kOas2TjQpMvidtZsx44S7TK_V3oveEtyZ95HC2zPC7ThSVynXShhKeWas8VfD5mPpnMQEBdffn8Ub2Pa6SShh6Qp67fE6t6tZpoWHezlE8Vv37Jwt9gDNIn7V6h4IACHa0A2rbnqsxXI',
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
