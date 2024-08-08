const db = require('../models/');
const axios = require('axios');
const qs = require('qs');
const { AMZ_REFRESH_URL, AMZ_ID_1, AMZ_REFRESH_TOKEN_1, AMZ_CLIENT_ID_1, AMZ_CLIENT_SECRET_1, AMZ_ID_2, AMZ_REFRESH_TOKEN_2, AMZ_CLIENT_ID_2, AMZ_CLIENT_SECRET_2 } = require('../config/config');


const TOKENS = [
  {
    id: AMZ_ID_1,
    refresh_token: AMZ_REFRESH_TOKEN_1,
    client_id: AMZ_CLIENT_ID_1,
    client_secret: AMZ_CLIENT_SECRET_1,
  },
  {
    id: AMZ_ID_2,
    refresh_token: AMZ_REFRESH_TOKEN_2,
    client_id: AMZ_CLIENT_ID_2,
    client_secret: AMZ_CLIENT_SECRET_2,
  },
];


module.exports = amazonAuth = async () => {






  const promises = TOKENS.map(async (token) => {
    const data = qs.stringify({
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      client_id: token.client_id,
      client_secret: token.client_secret,
    });
    const config = {
      method: 'post',
      url: AMZ_REFRESH_URL,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data,

    };

    try {
      const res = await axios(config);
      await db.Tokens.update({ access_token: res.data.access_token }, { where: { id: token.id } });
      console.log(`Updated access token for token ID ${token.id}`);
    } catch (error) {
      console.error(`Error refreshing token for ID ${token.id}`, error);
    }
  });

  await Promise.all(promises);



  return {}
}