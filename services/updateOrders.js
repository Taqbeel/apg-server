const axios = require("axios");
const db = require("../models");
const { CronJob } = require("cron");
const { OrderItems } = require("../associations/orderAssociations");
const getRefreshToken = require("./getRefreshToken");
const {
  SELLING_URL,
  AMZ_NAME_1,
  AMZ_NAME_2,
  // AMZ_NAME_3,
  // AMZ_NAME_4,
} = require("../config/config");
const { processOrders } = require("./vnOrders");
const amazonAuth = require("./amazonAuth");
const connection = require("../connection.js");

const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));

const job = new CronJob(
  "0 */30 * * * *",
  // "*/5 * * * *",
  async () => {
    console.log("You will see this message every 30 minutes");
    await amazonAuth();
    await updateOrders();
  },
  null,
  true,
  "system"
);

job.start();

const baseUrl = SELLING_URL;

let fetching = false;
let currentNameIndex = 0;

// const names = [AMZ_NAME_1, AMZ_NAME_2, AMZ_NAME_3, AMZ_NAME_4];
const names = [AMZ_NAME_1, AMZ_NAME_2];




const getInventoryData = async (sql, connection) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, rows) => {
      if (err) {
        console.log("SQL error", err);
        return reject(err);
      }

      if (rows?.recordset?.length === 0) {
        resolve({});
      } else {
        const itemNumber = `${rows.recordset[0]?.ItemNumber1}, ${rows.recordset[0]?.ItemNumber2}, ${rows.recordset[0]?.ItemNumber3}, ${rows.recordset[0]?.ItemNumber4}`;
        const itemColor = `${rows.recordset[0]?.ColorName1}, ${rows.recordset[0]?.ColorName2}, ${rows.recordset[0]?.ColorName3}, ${rows.recordset[0]?.ColorName4}`;
        const itemSize = rows.recordset[0]?.Size;
        resolve({ itemNumber, itemColor, itemSize });
      }
    });
  });
};






const fetchDetails = CronJob.from({
  cronTime: "*/3 * * * * *",
  onTick: async function () {
    console.log("fetching", fetching);
    console.log("fetchDetails Here");
    if (fetching) {
      fetching = false;
      const result = await db.Orders.findOne({
        where: {
          itemsFetched: false,
          vendorName: names[currentNameIndex],
        },
      });
      if (result?.dataValues?.id) {
        const data = await getRefreshToken(names[currentNameIndex]);
        const accessToken = data?.dataValues?.access_token;

        console.log(
          "result?.dataValues?.AmazonOrderId",
          result?.dataValues?.AmazonOrderId
        );

        await axios
          .get(
            `${baseUrl}/orders/v0/orders/${result?.dataValues?.AmazonOrderId}/orderItems`,
            { headers: { "x-amz-access-token": accessToken } }
          )
          .then(async (orderItem) => {
            fetching = true;
            const items = orderItem?.data?.payload?.OrderItems;
            console.log("items", items.length);
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

            let itemsFetched = false;

            items.forEach(async (item, index) => {
              itemsFetched = index === items.length - 1;


              const sql = `SELECT * FROM dbo.tblSkus WHERE [Vendor] = 'AlphaBroder' AND [Sku] = '${item?.SellerSKU}'`;


              const inventoryData = await getInventoryData(sql, connection);


              await axios
                .get(
                  `${baseUrl}/catalog/2022-04-01/items/${item.ASIN}?marketplaceIds=ATVPDKIKX0DER&includedData=attributes,images`,
                  { headers: { "x-amz-access-token": accessToken } }
                )
                .then(async (catalogue) => {
                  const exist = await db.OrderItems.findOne({
                    where: {
                      AmazonOrderId: result?.dataValues?.AmazonOrderId,
                      ASIN: item.ASIN,
                    },
                  });

                  if (exist) {
                    return;
                  }

                  const dimensions = catalogue?.data?.attributes
                    ?.item_package_dimensions
                    ? catalogue?.data?.attributes?.item_package_dimensions[0]
                    : null;
                  const weight = catalogue?.data?.attributes
                    ?.item_package_weight
                    ? catalogue?.data?.attributes?.item_package_weight[0]
                    : null;
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
                    AmazonOrderId: result?.dataValues?.AmazonOrderId,


                    itemColors: inventoryData?.itemColor || null,
                    itemNumbers: inventoryData?.itemNumber || null,
                    itemSize: inventoryData?.itemSize || null,
                  }).catch((err) => {
                    console.log(
                      "=<<<<<ERROROROROORORRORORO",
                      err?.response?.data
                    );
                  });
                })
                .catch((err) => {
                  console.log(
                    "==>>>>ERROROROROORORRORORO",
                    err?.response?.data
                  );
                });
            });

            if (itemsFetched || items.length === 0) {
              await axios(
                `${baseUrl}/orders/v0/orders/${result?.dataValues?.AmazonOrderId}/address`,
                { headers: { "x-amz-access-token": accessToken } }
              ).then(async (address) => {
                await db.Orders.update(
                  {
                    itemsFetched: true,
                    BuyerAddress: address?.data?.payload?.ShippingAddress,
                  },
                  { where: { id: result?.dataValues?.id } }
                ).then(async () => {
                  console.log("Final Data Saved with buyer info");
                });
              });
            }
          })
          .catch((err) => {
            console.log("ERROR VENDOR", names[currentNameIndex]);
            console.log("ERROR ACCESS TOKEN", accessToken);
            console.log("ERROROROROORORRORORO", err?.response?.data?.errors);
          });
      }
    } else if (currentNameIndex < names.length - 1) {
      console.log(
        "currentNameIndex < names.length",
        currentNameIndex < names.length
      );
      console.log("Job Stopped for ", currentNameIndex);
      fetchDetails.stop();
      fetching = false;
      currentNameIndex = (currentNameIndex + 1) % names.length;
      updateOrders();
    } else {
      console.log("Job Stopped");
      fetchDetails.stop();
      fetching = false;
      currentNameIndex = 0;
      // await processOrders();
    }
  },
  start: false,
  timeZone: "system",
});

module.exports = updateOrders = async () => {
  console.log("updateOrders here.....");
  console.log("currentNameIndex===>>>>>>>", currentNameIndex);
  const data = await getRefreshToken(names[currentNameIndex]);
  const accessToken = data?.dataValues?.access_token;
  console.log("accessToken", accessToken);
  console.log("_______________________________________________");

  const from = "CreatedAfter=2024-06-04T10:40:07Z";
  const status = "Unshipped";

  const parseOrder = (orderData) => {
    return {
      ...orderData,
      BuyerInfo: orderData?.BuyerInfo ?? null,
      // OrderTotal:orderData?.OrderTotal?JSON.stringify(orderData?.OrderTotal):null,
      Amount: orderData?.OrderTotal?.Amount,
      CurrencyCode: orderData?.OrderTotal?.CurrencyCode,
      DefaultShipFromLocationAddress:
        orderData?.DefaultShipFromLocationAddress ?? null,
      PaymentMethodDetails: orderData?.PaymentMethodDetails ?? null,
      EarliestDeliveryDate: orderData?.EarliestDeliveryDate
        ? new Date(orderData?.EarliestDeliveryDate)
        : null,
      EarliestShipDate: orderData?.EarliestShipDate
        ? new Date(orderData?.EarliestShipDate)
        : null,
      PurchaseDate: orderData?.PurchaseDate
        ? new Date(orderData?.PurchaseDate)
        : null,
      LatestDeliveryDate: orderData?.LatestDeliveryDate
        ? new Date(orderData?.LatestDeliveryDate)
        : null,
      LatestShipDate: orderData?.LatestShipDate
        ? new Date(orderData?.LatestShipDate)
        : null,
      vendorName: orderData?.DefaultShipFromLocationAddress?.Name ?? "",
    };
  };

  let temp = 0;
  console.log(
    `${baseUrl}/orders/v0/orders?${from}&MarketplaceIds=ATVPDKIKX0DER&OrderStatuses=${status}`
  );
  await axios
    .get(
      `${baseUrl}/orders/v0/orders?${from}&MarketplaceIds=ATVPDKIKX0DER&OrderStatuses=${status}`,
      {
        headers: { "x-amz-access-token": accessToken },
      }
    )
    .then(async (response) => {
      // console.log('orders response', response?.data?.payload)
      console.log("__________________");
      const list = response?.data?.payload?.Orders;
      console.log("Orders Length ", list.length);
      if (list.length == 0) {
        console.log("list.length", list.length);
        fetchDetails.start();
      }
      list.forEach(async (order, index) => {
        let tempData = { ...order };

        await db.Orders.upsert(parseOrder(tempData)).then((x) => {
          if (x[0]?.dataValues.itemsFetched == false) {
            temp = temp + 1;
            if (temp == 1) {
              console.log("Next Job Start For ", currentNameIndex);
              fetchDetails.start();
              fetching = true;
            }
          } else if (index === list.length - 1 && !fetching) {
            fetchDetails.start();
          }
        });
      });
    })
    .catch(function (error) {
      console.log(error?.response?.data);
      currentNameIndex = (currentNameIndex + 1) % names.length;
      updateOrders();
    });
};
