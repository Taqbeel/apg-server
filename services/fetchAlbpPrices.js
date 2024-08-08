const axios = require("axios");
const convert = require('xml-js');
const { Op } = require('sequelize');
const connection = require("../connection.js");
const { OrderItems } = require("../associations/orderAssociations");
const { AlbPurchaseOrder, PoItems } = require("../associations/poAssociations");
const { ALPHA_PASS, ALPHA_USER, ALPHA_BRODER_URL_ONLINE } = require("../config/config.js");

const API_BASE_URL = ALPHA_BRODER_URL_ONLINE
const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`;
const headers = { 'Authorization': 'Basic ' + Buffer.from('webdev:alpdev').toString("base64") };

const delay = (n) => new Promise((resolve) => setTimeout(resolve, n));

module.exports = fetchAlbpPrices = async (poId) => {
  console.log("fetching Alb Item Info")
  const item = await OrderItems.findOne({
    where: {
      priceFetched: false,
      isAlpha: true,
      AlbPurchaseOrderId: null
      // id:'981492875917918209'
    },
    attributes: ['id', 'SellerSKU', 'QuantityOrdered']
  });
  const sku = item?.dataValues?.SellerSKU;
  const qty = item?.dataValues?.QuantityOrdered;
  const sql = `SELECT * FROM dbo.tblSkus WHERE [Vendor] = 'AlphaBroder' AND [Sku] = '${sku}'`;
  console.log(sku)
  connection.query(sql, (err, rows) => {
    if (err instanceof Error || rows?.recordset?.length == 0) {
      console.log("Error Occured in Findind in DB")
    } else {
      // let itemNumbers = ['B181BEAC5'];
      let itemNumbers = [];
      rows?.recordset[0]?.ItemNumber1 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber1) : null;
      rows?.recordset[0]?.ItemNumber2 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber2) : null;
      rows?.recordset[0]?.ItemNumber3 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber3) : null;
      rows?.recordset[0]?.ItemNumber4 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber4) : null;
      itemNumbers.length > 0 ? fetchPrices(itemNumbers, itemNumbers.length, item?.dataValues?.id, poId, qty) : null
    }
  });
};

const fetchPrices = (itemNumers, itemLength, orderItemId, poId, qty) => {
  const headerItemNos = itemNumers.map((x, i) => `&in${i + 1}=${x}`).join("");
  console.log("Fetching Alb Item Price")
  console.log(headerItemNos)
  let APIURL = API_BASE_URL + API_CREDENTIALS + headerItemNos + '&pr=y';
  let itemList = []
  try {
    axios.get(APIURL, {
      headers
    }).then(async (response) => {
      let price = 0;
      if (response !== null) {
        const xmlData = await convert.xml2json(response.data, {
          compact: true,
          space: 4
        });
        if (itemLength == 1) {
          // console.log(JSON.parse(xmlData)["inv-balance"]?.item)
          const itemValues = JSON.parse(xmlData)["inv-balance"]?.item
          itemList.push({
            itemNo: itemValues?._attributes['item-number'],
            styleNo: itemValues?._attributes['style-code'],
            colorNo: itemValues?._attributes['color-code'],
            sizeNo: itemValues?._attributes['size-code'],
            qty: qty,
            shipToCompany: 'ABC Company',
            shipToAttention: 'Sohail A Butt',
            shipToStreet1: '86 lackawanna ave',
            shipToCity: "woodland Park",
            shipToState: "NJ",
            shipToPostal: "07424",
            splitShip: 'N',
            customerEmail: 'sabdullah369@gmail.com',
            AlbPurchaseOrderId: poId
          })
          if (itemValues?._attributes["special-price"]) {
            price = price + Number(itemValues?._attributes["special-price"].slice(1)) * qty
          } else {
            price = price + Number(itemValues?._attributes?.price.slice(1)) * qty
          }
        } else {
          JSON.parse(xmlData)["inv-balance"].item.forEach((x) => {
            if (x?._attributes["special-price"]) {
              price = price + Number(x?._attributes["special-price"].slice(1)) * qty
            } else {
              price = price + Number(x?._attributes?.price.slice(1)) * qty
            }
            itemList.push({
              itemNo: x?._attributes['item-number'],
              styleNo: x?._attributes['style-code'],
              colorNo: x?._attributes['color-code'],
              sizeNo: x?._attributes['size-code'],
              qty: qty,
              shipToCompany: 'ABC Company',
              shipToAttention: 'Sohail A Butt',
              shipToStreet1: '86 lackawanna ave',
              shipToCity: "woodland Park",
              shipToState: "NJ",
              shipToPostal: "07424",
              splitShip: 'N',
              customerEmail: 'sabdullah369@gmail.com',
              AlbPurchaseOrderId: poId
            })
          })
        }
      }
      updateInfo(itemList, orderItemId, poId, price)
    })
  } catch (error) {
    console.log(error.message)
  }
};

const updateInfo = async (itemList, orderItemId, poId, price) => {
  console.log("Updating PO & OrderItem Info")
  await OrderItems.update({ AlbPurchaseOrderId: poId }, { where: { id: orderItemId } })
  const po = await AlbPurchaseOrder.findOne({
    where: { id: poId },
    attributes: ['total']
  })
  const total = po.dataValues.total + price
  await AlbPurchaseOrder.update(
    { total: total },
    { where: { id: poId } }
  )
  await PoItems.bulkCreate(itemList).then(() => {
    console.log("Adding Price of ", price);
    console.log(total)
  })
  await delay(1000);
  if (total >= 50) {
    console.log("P.O Complete")
  } else {
    fetchAlbpPrices(poId)
  }
};