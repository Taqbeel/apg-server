const axios = require('axios');
const db = require('../models');
const { CronJob } = require('cron');
const { OrderItems } = require("../associations/orderAssociations");
const getRefreshToken = require("./getRefreshToken");
const { SELLING_URL, AMZ_ID_1, AMZ_ID_2, AMZ_ID_3, AMZ_ID_4 } = require('../config/config');
const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));


const job = new CronJob('0 */30 * * * *', async () => {
  console.log('You will see this message every minute');
  await amazonAuth().then(() => { })
  await updateOrders()
}, null, true, 'system');

job.start();


const baseUrl = SELLING_URL

let fetching = false
// let accessToken = '';
let currentTokenIndex = 0;
const tokens = [AMZ_ID_1, AMZ_ID_2, AMZ_ID_3, AMZ_ID_4];

const fetchDetails = CronJob.from({
  cronTime: '*/3 * * * * *',
  onTick: async function () {
    console.log('fetching', fetching)
    console.log("fetchDetails Here")
    if (fetching) {
      fetching = false
      const result = await db.Orders.findOne({
        where: {
          itemsFetched: false
        }
      });
      if (result?.dataValues?.id) {

        const data = await getRefreshToken(tokens[currentTokenIndex]);
        accessToken = data?.dataValues?.access_token

        const config = {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-amz-access-token': accessToken
          }
        };

        // console.log('config', config)
        console.log('result?.dataValues?.AmazonOrderId', result?.dataValues?.AmazonOrderId)

        // fetch Order Items
        await axios({
          ...config,
          url: `${baseUrl}/orders/v0/orders/${result?.dataValues?.AmazonOrderId}/orderItems`,
        }).then((orderItem) => {
          const items = orderItem?.data?.payload?.OrderItems;
          console.log('items', items)
          console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
          items.forEach(async (item) => {
            // console.log("Items Fetched")
            await delay(400);
            await axios({
              ...config,
              url: `${baseUrl}/catalog/2022-04-01/items/${item.ASIN}?marketplaceIds=ATVPDKIKX0DER&includedData=attributes,images`
            }).then((catalogue) => {
              // console.log(item.ASIN)
              const dimensions = catalogue?.data?.attributes?.item_package_dimensions ?
                catalogue?.data?.attributes?.item_package_dimensions[0] : null
              const weight = catalogue?.data?.attributes?.item_package_weight ?
                catalogue?.data?.attributes?.item_package_weight[0] : null
              OrderItems.upsert({
                ...item,
                TaxAmount: item.ItemTax.Amount,
                ItemPriceAmount: item.ItemPrice.Amount,
                PromotionDiscountTax: item.PromotionDiscountTax.Amount,
                PromotionDiscountAmount: item.PromotionDiscount.Amount,
                OrderId: result?.dataValues?.id,
                image: catalogue?.data?.images[0]?.images[0]?.link,
                dimensions: dimensions,
                weight: weight,
              }).then(async () => {
                await delay(400);
                await axios({
                  ...config,
                  url: `${baseUrl}/orders/v0/orders/${result?.dataValues?.AmazonOrderId}/address`
                }).then(async (address) => {
                  await db.Orders.update(
                    {
                      itemsFetched: true,
                      BuyerInfo: address?.data?.payload?.ShippingAddress
                    },
                    { where: { id: result?.dataValues?.id } }
                  ).then(async () => {
                    // console.log("Final Data Saved with buyer info")
                    // console.log("----------------------------")
                    fetching = true
                  })
                })
                //https://sellingpartnerapi-na.amazon.com
              }).catch((err) => {
                console.log('=<<<<<ERROROROROORORRORORO', err?.response?.data)
              })
            }).catch((err) => {
              console.log('==>>>>ERROROROROORORRORORO', err?.response?.data)
            })
          })
        }).catch((err) => {
          console.log('ERROR TOKEN', tokens[currentTokenIndex])
          console.log('ERROR ACCESS TOKEN', accessToken)
          console.log('ERROROROROORORRORORO', err?.response?.data?.errors)
        })
        // }
      }
    } else if (currentTokenIndex < tokens.length - 1) {
      console.log("currentTokenIndex < tokens.length", currentTokenIndex < tokens.length)
      console.log("Job Stopped for ", currentTokenIndex)
      fetchDetails.stop();
      fetching = false;
      currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
      updateOrders();
    } else {
      console.log("Job Stopped")
      fetchDetails.stop();
      fetching = false
    }
  },
  start: false,
  timeZone: 'system'
});

module.exports = updateOrders = async () => {
  console.log('updateOrders here.....')
  console.log("currentTokenIndex===>>>>>>>", currentTokenIndex)
  const data = await getRefreshToken(tokens[currentTokenIndex]);
  accessToken = data?.dataValues?.access_token
  console.log("accessToken", accessToken)
  console.log("_______________________________________________")
  const config = {
    method: 'get',
    headers: {
      'Accept': 'application/json',
      'x-amz-access-token': accessToken
    }
  };

  const from = 'CreatedAfter=2024-06-04T10:40:07Z'
  const status = 'Unshipped'
  const orders = {
    ...config,
    url: `${baseUrl}/orders/v0/orders?${from}&MarketplaceIds=ATVPDKIKX0DER&OrderStatuses=${status}`,
  };

  const parseOrder = (orderData) => {
    return {
      ...orderData,
      BuyerInfo: orderData.BuyerInfo ? orderData.BuyerInfo : null,
      // OrderTotal:orderData.OrderTotal?JSON.stringify(orderData.OrderTotal):null,
      Amount: orderData.OrderTotal.Amount,
      CurrencyCode: orderData.OrderTotal.CurrencyCode,
      PaymentMethodDetails: orderData.PaymentMethodDetails ? orderData.PaymentMethodDetails : null,
      EarliestDeliveryDate: orderData.EarliestDeliveryDate ? new Date(orderData.EarliestDeliveryDate) : null,
      EarliestShipDate: orderData.EarliestShipDate ? new Date(orderData.EarliestShipDate) : null,
      PurchaseDate: orderData.PurchaseDate ? new Date(orderData.PurchaseDate) : null,
      LatestDeliveryDate: orderData.LatestDeliveryDate ? new Date(orderData.LatestDeliveryDate) : null,
      LatestShipDate: orderData.LatestShipDate ? new Date(orderData.LatestShipDate) : null,
    }
  };

  let temp = 0;
  await axios(orders).then(async (response) => {

    console.log('orders response', response?.data?.payload)
    console.log('__________________')
    const list = response?.data?.payload?.Orders;
    console.log('Orders Length ', list.length)
    if (list.length == 0) {
      fetchDetails.start();
    }
    list.forEach(async (order, index) => {

      console.log('index', index)
      console.log('index === list.length - 1 && !fetching', !fetching, index === list.length - 1 && !fetching)
      console.log('list and index', list.length, index, index === list.length - 1)
      let tempData = { ...order };
      delete tempData.BuyerInfo
      await db.Orders.upsert(parseOrder(tempData))
        .then((x) => {

          // console.log('index === list.length - 1 ', index, list.length - 1, index === list.length - 1)
          if (x[0]?.dataValues.itemsFetched == false) {
            temp = temp + 1;
            if (temp == 1) {
              console.log("Next Job Start For ", currentTokenIndex)
              fetchDetails.start();
              fetching = true
            }
          }
          else if (index === list.length - 1 && !fetching) {
            fetchDetails.start();
          }
        })
    });
  }).catch(function (error) {
    // console.log(error);
  });
};