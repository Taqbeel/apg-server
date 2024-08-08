const { Op } = require('sequelize');
const { AlbPurchaseOrder, PoItems, AlbShippingBox, AlbPoCompleted } = require("../associations/poAssociations");
const fetchAlbpPrices = require("../services/fetchAlbpPrices");
const FormData = require('form-data');
const axios = require('axios');
const convert = require('xml-js');
const fs = require('fs');
const dayjs = require('dayjs');
const { ALPHA_USER, ALPHA_CN, ALPHA_PASS, ALPHA_BRODER_URL, ALPHA_BEARER } = require('../config/config');

module.exports = uploadPo = async (req, res) => {

  const poData = await AlbPurchaseOrder.findOne({
    where: { isComplete: false },
    include: [{ model: PoItems }]
  });
  let csvHeader = "";
  const itemList = poData.dataValues.PoItems
  itemList.forEach((x, i) => {
    let itemInfo = `${poData.dataValues.customerName},${poData.dataValues.customerPo},${poData.dataValues.carrier},${x.dataValues.itemNo},${x.dataValues.styleNo},${x.dataValues.colorNo},${x.dataValues.sizeNo},${x.dataValues.qty},${x.dataValues.shipToCompany},${x.dataValues.shipToAttention},${x.dataValues.shipToStreet1},,${x.dataValues.shipToCity},${x.dataValues.shipToState},${x.dataValues.shipToPostal},,,,Y,,${x.dataValues.customerEmail}`
    if (i != 0) {
      csvHeader = csvHeader + '\n' + itemInfo
    } else if (i == 0) {
      csvHeader = csvHeader + itemInfo
    }
  });
  console.log(csvHeader);
  await fs.promises.writeFile('myfile.csv', csvHeader);
  var data = new FormData();
  data.append('userName', ALPHA_USER);
  data.append('cn', ALPHA_CN);
  data.append('password', ALPHA_PASS);
  data.append('FILE1', fs.createReadStream("myfile.csv"));
  const config = {
    method: 'post',
    url: ALPHA_BRODER_URL,
    headers: {
      'Authorization': ALPHA_BEARER,
      ...data.getHeaders()
    },
    data: data
  };
  axios(config)
    .then(async function (response) {
      const xmlData = await convert.xml2json(response.data, {
        compact: true,
        space: 4
      });
      const responce = JSON.parse(xmlData)
      console.log(responce)
      AlbPoCompleted.create({
        creditcard: responce.order._attributes.creditcard,
        orderreferenceno: responce.order._attributes?.orderreferenceno,
        responsecode: responce.order._attributes?.responsecode,
        customerpo: responce.order.customerpo?._text,
        freighttotal: Number(responce.order?.freighttotal?._text),
        taxtotal: Number(responce.order?.taxtotal?._text),
        coupon: responce.order.coupon?._text,
        ordervalue: Number(responce?.order?.ordervalue?._text),
        address: responce.order?.shippingpage?.shiptoaddresses?.address,
        shipmethod: responce.order?.shipviapage?.shipmethods?.shipmethod,
        AlbPurchaseOrderId: poData.dataValues.id
      }).then((po) => {
        let poItems = [];
        responce?.order?.shoppingbox?.lineitem?.forEach((x) => {
          poItems.push({
            style: x.style?._text,
            description: x.description?._text,
            color: x.color?._text,
            size: x.size?._text,
            pieces: x.pieces?._text,
            price: x.price?._text,
            amount: x.amount?._text,
            warehouse: x.warehouse?._text,
            weight: x.weight?._text,
            itemcode: x.itemcode?._text,
            upccode: x.upccode?._text,
            shippernumber: x.shippernumber?._text,
            shipstatus: x.shipstatus?._text,
            AlbPoCompletedId: po.id
          })
          console.log(poItems);
        });
        AlbShippingBox.bulkCreate(poItems);
        AlbPurchaseOrder.update({
          isComplete: true
        }, {
          where: { id: poData.dataValues.id }
        });
      })
      res.json({
        status: "success",
        ...responce
      });
    })
    .catch(function (error) {
      console.log(error);
      res.json({ status: "error" });
    });
  // res.json({ status:"success" });
}