const axios = require("axios");
const { Op } = require("sequelize");
const { Orders, OrderItems } = require("../associations/orderAssociations");
const {
  ALPHA_BRODER_URL,
  ALPHA_CN,
  ALPHA_PASS,
  ALPHA_USER,
  ALPHA_BEARER,
  ALPHA_BRODER_URL_ONLINE,
} = require("../config/config");
const connection = require("../connection.js");
const convert = require("xml-js");
var FormData = require("form-data");
var fs = require("fs");

// const whseList = ["PA", "MA", "CH", "GA", "FO", "KC"];
const whseList = ["PH", "MA", "CC", "GD", "FO", "KC", "TD", "CN"];
const priorityWhsList = [
  ["PH", "MA"],
  ["CC", "GD", "FO"],
  ["KC", "TD"],
  ["CN"],
];

const processOrders = async () => {
  try {
    // Fetch orders that do not start with 'bulk'
    const orders = await OrderItems.findAll({
      where: {
        SellerSKU: {
          [Op.notILike]: "%bulk%",
        },
        poNumber: null,
      },
      limit: 40,
    });

    console.log('orders', orders.length)

    let tempInventory = [];
    let tempOrders = [];
    let itemNos = [];
    let count = 0;

    let batchTotal = 0;
    let batchOrders = [];

    // Step 1: Check inventory for each order item
    for (const order of orders) {
      const sku = order.dataValues.SellerSKU;
      const AmazonOrderId = order.dataValues.AmazonOrderId;
      const qty = Number(order.dataValues.ProductInfo['NumberOfItems']) * Number(order.dataValues.QuantityOrdered);
      console.log('qty', qty)

      // Fetch inventory for the item
      const res = await getItemInventoryById(sku);

      if (res.status === "success") {
        // console.log("res ==>>>>", { ...res, sku });
        tempInventory.push({ ...res, sku, AmazonOrderId, qty });
        // res?.data?.itemNumbers.length>0 ? fetchAddtionalOrders(res?.data?.itemNumbers) : null;
        res?.itemNumbers?.forEach((itmNo) => itemNos.push(itmNo));
        count = count + 1;
        // if (count == orders.length) {
        // globalItemsList = tempInventory

        const result = await Promise.all(
          itemNos.map(async (item) => await getInventoryByItemNumber(item))
        );


        if (result?.length > 0) {
          const resultWithQty = result.map((item, index) => ({
            ...item,
            qty, // Assign the same qty to each item in result
          }));

          // console.log("result ====>>>>", resultWithQty);


          tempInventory.push(...resultWithQty);
        }

      }
    }

    console.log('tempInventory', tempInventory)

    for (const item of tempInventory) {
      // console.log(item["inv-balance"]?.item?.whse)

      const whses = item["inv-balance"]?.item?.whse
        ?.filter((whse) => {
          // console.log('item', item["inv-balance"]?.item?._attributes["item-number"])
          // console.log('whse', whse)
          // console.log('whse?._attributes', whse?._attributes)
          return whseList.includes(whse?._attributes?.code);

        })
      // .map((whse) => {
      //   const desc = getWhseDesc(whse?._attributes?.code, item);
      //   console.log("desc", desc);
      // });

      // console.log('whses', whses)


      const selectedWhs = findPriorityWarehouse(priorityWhsList, whses);
      const desc = selectedWhs ? getWhseDesc(selectedWhs?._attributes?.code, item) : '';

      console.log('selectedWhs', selectedWhs)
      item['whs'] = selectedWhs
      item['expectedDelivery'] = desc


      // console.log('item', item)

      const totalPrice = getTotalPrice(item);
      // console.log("totalPrice", totalPrice);

      batchTotal += totalPrice;
      batchOrders.push(item);
      console.log("batchTotal", batchTotal);

      if (batchTotal > 220) {
        const success = await placeOrder(batchOrders);
        if (success) {
          batchTotal = 0;
          batchOrders = [];
        }
        break
      }
    }

    console.log("Order processing completed.");
  } catch (error) {
    console.error("Error processing orders:", error);
  }
};

const getWhseDesc = (whse, _item) => {
  const item = _item["inv-balance"]["whse-info"]["whse-item"].filter(
    (x) => x._attributes.whse == whse
  )[0];
  return `Carrier Days: ${item._attributes["carrier-days"]}, cutoff: ${item._attributes.cutoff
    }, Est Deliver: ${item._attributes["est-delivery"]}, Transit Days: ${item._attributes["transit-days"]
    } --- ${item["cutoff-msg"]._text || ""}`;
};

const getTotalPrice = (item) => {
  return (
    parseFloat(
      item["inv-balance"]?.item?._attributes["special-price"]?.slice(1)
    ) || parseFloat(item["inv-balance"]?.item?._attributes["price"]?.slice(1))
  ) * item.qty;
};


const findPriorityWarehouse = (priorityWhsList, whs) => {
  for (const priorityGroup of priorityWhsList) {
    const foundWhs = whs?.find(w => priorityGroup.includes(w._attributes.code) && parseInt(w._text) > 0);

    if (foundWhs) {
      return foundWhs;
    }
  }

  // Return null or something else if no warehouse matches the condition
  return null;
};

const placeOrder = async (orders) => {
  try {
    // Generate a Purchase Order (PO) number
    const poNumber = generatePoNumber();

    console.log("poNumber", poNumber, "orders", orders.length);


    // // Map through orders to create CSV rows
    // const rows = orders
    //   .map((order) => console.log(order?.sku))


    // Map through orders to create CSV rows
    const rows = orders
      .map((order) => createCsvRow(order, poNumber))
      .join("\n");

    // Write to CSV file
    await fs.promises.writeFile("myfile.csv", rows, "utf8");

    console.log("CSV file successfully created.");

    const orderPlaced = await createPo();

    // console.log(`Order placed with PO number: ${poNumber}`, '==>>', orderPlaced?.order?.shippingpage?.shiptoaddresses?.address?.attention, orderPlaced?.order?.error);
    console.log(`Order placed with PO number: ${poNumber}`, '==>>', orderPlaced?.order, orderPlaced?.order?.error);
    if (!orderPlaced?.order?.error) {
      const trackingNumber = orderPlaced?.order?._attributes?.orderreferenceno
      console.log('trackingNumber', trackingNumber)
      await Promise.all(orders.map((order) => {
        const expectedDelivery = order?.expectedDelivery
        console.log('expectedDelivery', expectedDelivery)
        if (order.sku) {
          OrderItems.update({ poNumber, trackingNumber, expectedDelivery }, { where: { SellerSKU: order.sku } })
          Orders.update({ OrderStatus: 'Arriving' }, { where: { AmazonOrderId: order.AmazonOrderId } })
        }
      }));
    }
    return true;
  } catch (error) {
    console.error("Error placing order:", error);
    return false;
  }
};

// Function to generate a unique PO number
const generatePoNumber = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PO-${result}`;
};

const createCsvRow = (order, poNumber) => {
  // return `3451167,PO-${poNumber},UPS-Surface,${order["inv-balance"]?.item?._attributes["item-number"]},,${order["inv-balance"]?.item?._attributes["color-code"]},${order["inv-balance"]?.item?._attributes["size-code"]},1,ABC Company,Sohail A Butt,86 lackawanna ave,ste103,woodland Park,NJ,07424,${order.whs?._attributes?.code},,,N,,mtrock6991@gmail.com`;
  return `3451167,${poNumber},UPS-Surface,${order["inv-balance"]?.item?._attributes["item-number"]},,${order["inv-balance"]?.item?._attributes["color-code"]},${order["inv-balance"]?.item?._attributes["size-code"]},${order.qty},ApparelGlobe,Sohail A Butt,86 lackawanna ave,ste103,woodland Park,NJ,07424,${order.whs?._attributes?.code},Y,,Y,,,`;
  // const orderData = `3451167,PO-${dayjs().format("HH:mm:ss")},UPS-Surface,${inventory[0]["inv-balance"]?.item?._attributes["item-number"]},,${inventory[0]["inv-balance"]?.item?._attributes["color-code"]},${inventory[0]["inv-balance"]?.item?._attributes["size-code"]},1,ABC Company,Sohail A Butt,86 lackawanna ave,,woodland Park,NJ,07424,PH,,,N,,sabdullah369@gmail.com`
};

// Function to get item inventory by SKU using Alpha Broder API
const getItemInventoryById = async (sku) => {
  const API_BASE_URL = ALPHA_BRODER_URL_ONLINE;
  const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`;
  const sql = `SELECT * FROM dbo.tblSkus WHERE [Vendor] = 'AlphaBroder' AND [Sku] = '${sku}'`;
  const headers = {
    Authorization: "Basic " + Buffer.from("webdev:alpdev").toString("base64"),
  }; //this is needed for dev

  return new Promise((resolve, reject) => {
    connection.query(sql, (err, rows) => {
      if (err) {
        console.log("SQL error", err);
        return reject(err);
      }

      if (rows?.recordset?.length == 0) {
        resolve({
          message: "No inventory found",
          status: "error",
        });
      } else {
        let itemNumbers = [];
        // console.log('rows?.recordset[0]', rows?.recordset[0])
        rows?.recordset[0]?.ItemNumber2
          ? itemNumbers.push(rows?.recordset[0]?.ItemNumber2)
          : null;
        rows?.recordset[0]?.ItemNumber3
          ? itemNumbers.push(rows?.recordset[0]?.ItemNumber3)
          : null;
        rows?.recordset[0]?.ItemNumber4
          ? itemNumbers.push(rows?.recordset[0]?.ItemNumber4)
          : null;

        const APIURL =
          API_BASE_URL +
          API_CREDENTIALS +
          "&in1=" +
          rows?.recordset[0]?.ItemNumber1 +
          "&pr=y";

        axios
          .get(APIURL, { headers })
          .then(async (response) => {
            if (response !== null) {
              const xmlData = await convert.xml2json(response.data, {
                compact: true,
                space: 4,
              });
              const parsedData = JSON.parse(xmlData);
              // console.log("Parsed inventory data: _attributes", parsedData['inv-balance']['whse-info']['whse-item'][0]);
              // console.log("Parsed inventory data:", parsedData['inv-balance']['whse-info']['cutoff-msg']);
              // console.log("Parsed inventory data:", parsedData['inv-balance']['whse-info']['whse-msg']);
              resolve({
                ...parsedData,
                itemNumbers,
                status: "success",
              });
            } else {
              resolve({
                message: "Response error",
                status: "error",
              });
            }
          })
          .catch((error) => {
            reject({
              message: error.message,
              status: "error",
            });
          });
      }
    });
  });
};

const getInventoryByItemNumber = async (itemId) => {
  const API_BASE_URL = ALPHA_BRODER_URL_ONLINE;
  const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`;
  let APIURL = API_BASE_URL + API_CREDENTIALS + "&in1=" + itemId + "&pr=y";
  // console.log('Basic ' + Buffer.from('webdev:alpdev').toString("base64"))

  return new Promise((resolve, reject) => {
    axios
      .get(APIURL, {
        headers: {
          Authorization:
            "Basic " + Buffer.from("webdev:alpdev").toString("base64"), // this is needed for dev
        },
      })
      .then(async (response) => {
        const xmlData = await convert.xml2json(response.data, {
          compact: true,
          space: 4,
        });
        const parsedData = JSON.parse(xmlData);
        // console.log(parsedData)
        resolve({
          ...parsedData,
          itemId
        });
      })
      .catch((error) => {
        console.log(error);
        reject({
          status: "error",
        });
      });
  });
};

const createPo = async () => {
  var data = new FormData();
  data.append("userName", ALPHA_USER);
  data.append("cn", ALPHA_CN);
  data.append("password", ALPHA_PASS);
  data.append("FILE1", fs.createReadStream("myfile.csv"));

  var config = {
    method: "post",
    url: ALPHA_BRODER_URL,
    headers: {
      Authorization: ALPHA_BEARER,
      ...data.getHeaders(),
    },
    data: data,
  };

  return new Promise((resolve, reject) => {
    axios(config)
      .then(async function (response) {
        console.log("here");
        const xmlData = await convert.xml2json(response.data, {
          compact: true,
          space: 4,
        });
        resolve({
          status: "success",
          ...JSON.parse(xmlData),
        });
      })
      .catch(function (error) {
        console.log('error ===>>>> ', error?.response?.data);
        reject({ status: "error", error: error?.response?.data });
      });
  });
};

module.exports = { processOrders };
