const db = require('../models');

module.exports = getRefreshToken = async (vendorName) => {
  return await db.Tokens.findOne({
    where: { vendorName },
    attributes: ['access_token']
  })
}