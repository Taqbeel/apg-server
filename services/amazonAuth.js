const db = require('../models/');
const axios = require('axios');
const qs = require('qs');
const { AMZ_REFRESH_URL, AMZ_ID_1, AMZ_REFRESH_TOKEN_1, AMZ_CLIENT_ID_1, AMZ_CLIENT_SECRET_1, AMZ_ID_2, AMZ_REFRESH_TOKEN_2, AMZ_CLIENT_ID_2, AMZ_CLIENT_SECRET_2, AMZ_CLIENT_SECRET_3, AMZ_CLIENT_ID_3, AMZ_REFRESH_TOKEN_3, AMZ_ID_3, AMZ_ID_4, AMZ_REFRESH_TOKEN_4, AMZ_CLIENT_ID_4, AMZ_CLIENT_SECRET_4, AMZ_NAME_1, AMZ_NAME_2, AMZ_NAME_3, AMZ_NAME_4 } = require('../config/config');


const TOKENS = [
  {
    id: AMZ_ID_1,
    vendorName: AMZ_NAME_1,
    refresh_token: AMZ_REFRESH_TOKEN_1,
    client_id: AMZ_CLIENT_ID_1,
    client_secret: AMZ_CLIENT_SECRET_1,
  },
  {
    id: AMZ_ID_2,
    vendorName: AMZ_NAME_2,
    refresh_token: AMZ_REFRESH_TOKEN_2,
    client_id: AMZ_CLIENT_ID_2,
    client_secret: AMZ_CLIENT_SECRET_2,
  },
  {
    id: AMZ_ID_3,
    vendorName: AMZ_NAME_3,
    refresh_token: AMZ_REFRESH_TOKEN_3,
    client_id: AMZ_CLIENT_ID_3,
    client_secret: AMZ_CLIENT_SECRET_3,
  },
  {
    id: AMZ_ID_4,
    vendorName: AMZ_NAME_4,
    refresh_token: AMZ_REFRESH_TOKEN_4,
    client_id: AMZ_CLIENT_ID_4,
    client_secret: AMZ_CLIENT_SECRET_4,
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
      await db.Tokens.update({ access_token: res.data.access_token }, { where: { vendorName: token.vendorName } });
      console.log(`Updated access token for token ${token.vendorName}`);
    } catch (error) {
      console.error(`Error refreshing token for ID ${token.id}`, error?.response?.data);
    }
  });

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error(`Error refreshing tokens`, error?.response?.data);
  }

  return {}
}