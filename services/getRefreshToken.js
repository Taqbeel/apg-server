const db = require('../models');

module.exports = getRefreshToken = async (token) => {
  let result
  await db.Tokens.findOne({
    where: {
      id: token
    },
    attributes: ['access_token']
  }).then((x) => {
    result = x
  })

  return result
}