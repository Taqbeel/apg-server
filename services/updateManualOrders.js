const axios = require('axios');
const { CronJob } = require('cron');
const { OrderItems } = require("../associations/orderAssociations");
const connection = require("../connection.js")
const getRefreshToken = require("./getRefreshToken");
const { SELLING_URL } = require('../config/config.js');
const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));

const baseUrl = SELLING_URL
let fetching = false

const fetchDetails = CronJob.from({
  cronTime: '*/5 * * * * *',
  onTick: async function () {
    const data = await getRefreshToken();
    const config = {
      method: 'get',
      headers: {
        'Accept': 'application/json',
        'x-amz-access-token': data?.dataValues?.access_token
      }
    };
    console.log("Here")
    OrderItems.findOne({
      where: {
        isAlpha: true,
        image: "unfetched"
      },
      attributes: ['id', 'SellerSKU']
    }).then((x) => {
      // const sql = `SELECT * FROM dbo.tblSkus WHERE [Vendor] = 'AlphaBroder' AND [Sku] = '${x.dataValues.SellerSKU}'`;
      // connection.query(sql, (err, rows) => {
      //   if (err instanceof Error) {
      //     console.log(err);
      //   };
      //   console.log(rows);
      //   console.log(rows.recordset[0].ASIN.slice(6));
      //   try {
      //     axios({
      //       ...config,
      //       url: `${baseUrl}/catalog/2022-04-01/items/${rows.recordset[0].ASIN}?marketplaceIds=ATVPDKIKX0DER&includedData=attributes,images`
      //     }).then((catalog)=>{
      //       console.log(catalog)
      //     })
      //   } catch (error) {
      //     console.log(error.message + ' in Asin No ' + rows.recordset[0].ASIN.slice(6))
      //   }
      // });
    })
    fetchDetails.stop();
  },
  start: false,
  timeZone: 'system'
});

module.exports = updateManualOrders = () => {
  fetchDetails.start()
};