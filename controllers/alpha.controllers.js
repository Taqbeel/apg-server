const db = require("../models");
const { Users, Orders, OrderItems, OrderShipment } = require("../associations/orderAssociations")
const getRefreshToken = require("../services/getRefreshToken");
const axios = require("axios");
const { Op } = require('sequelize');
const convert = require('xml-js');
const connection = require("../connection.js");
var FormData = require('form-data');
var fs = require('fs');
const { ALPHA_BRODER_URL_REQ, ALPHA_PASS, ALPHA_USER, ALPHA_BRODER_URL_ONLINE } = require("../config/config.js");

exports.getInventory = async (req, res) => {

  const API_BASE_URL = ALPHA_BRODER_URL_REQ
  const API_CREDENTIALS = `&userName=${ALPHA_USER}&password=${ALPHA_PASS}`;

  let APIURL = API_BASE_URL + API_CREDENTIALS;
  await axios.get(APIURL, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('webdev:alpdev').toString("base64") // this is needed for dev
    }
  }).then(async (response) => {
    const xmlData = await convert.xml2json(response.data, {
      compact: true,
      space: 4
    });
    res.json({
      status: "success",
      ...JSON.parse(xmlData)
    })
  })
    .catch((error) => {
      console.log(error?.response?.data)
      res.json({
        status: 'error'
      })
    });
};

exports.getBulkInventoryByItem = async (req, res) => {
  const API_BASE_URL = ALPHA_BRODER_URL_ONLINE
  const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`
  const API_STAGGER = 200; // number of ms between calls
  const API_THREADS = 3; // number of max concurrent calls
  // example set of items for which to find inventory
  var items = [
    'B11007514',
    'B11007515',
    'H484P2510',
    'B007NL515',
    'B002CN513',
    'B007NL514',
    'B11007516',
    'B03307515',
    'B007NL516',
  ];
  var itemIndex = 0;
  var itemResponses = [];
  var staggerIncrement = 0;
  var threadCount = 0;

  var main = setInterval(() => {
    try {
      if (itemResponses.length == items.length) {
        clearInterval(main);
      }
      for (; itemIndex < items.length && threadCount < API_THREADS; itemIndex++) {
        if (staggerIncrement % API_THREADS == 0) staggerIncrement = 0; // reset stagger each time we make API_THREADS requests

        console.log('calling ' + items[itemIndex] + ' with ' + staggerIncrement * API_STAGGER + ' ms stagger');

        getInventory(items[itemIndex], staggerIncrement)
          .then(response => {
            console.log(response.data)
            itemResponses.push(response);
          })
          .catch(error => {
            itemResponses.push(error);
            // handle errors here
          })
          .finally(() => {
            threadCount--;
          });
        staggerIncrement++;
        threadCount++;
      }
    } catch (error) {
      console.log("Error On Try getInventory: " + error);
    }
  }, 1);

  const getInventory = (itemId, stagger) => {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        let APIURL = API_BASE_URL + API_CREDENTIALS + '&in1=' + itemId + '&pr=y';
        const axios = require('axios')
        axios.get(APIURL, {
          headers: {
            'Authorization': 'Basic ' + Buffer.from('webdev:alpdev').toString("base64") // this is needed for dev
          }
        })
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      }, stagger * API_STAGGER);  // this forces some spacing out of the requests
    })
  }
  res.json({
    status: 'error'
  });
};

exports.getInventoryByIdTest = async (req, res) => {
  const API_BASE_URL = ALPHA_BRODER_URL_ONLINE
  const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`

  const itemId = 'B015NL513';
  let APIURL = API_BASE_URL + API_CREDENTIALS + '&in1=' + itemId + '&pr=y';
  // console.log('Basic ' + Buffer.from('webdev:alpdev').toString("base64"))
  await axios.get(APIURL, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('webdev:alpdev').toString("base64") // this is needed for dev
    }
  }).then(async (response) => {
    // console.log(response.data)
    const xmlData = await convert.xml2json(response.data, {
      compact: true,
      space: 4
    });
    res.json(JSON.parse(xmlData))
  })
    .catch((error) => {
      console.log(error)
      res.json({
        status: 'error'
      })
    });
};

exports.getInventoryByItemNumber = async (req, res) => {
  const API_BASE_URL = ALPHA_BRODER_URL_ONLINE
  const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`
  // console.log(req.headers.id)
  const itemId = req.headers.id;
  let APIURL = API_BASE_URL + API_CREDENTIALS + '&in1=' + itemId + '&pr=y';
  // console.log('Basic ' + Buffer.from('webdev:alpdev').toString("base64"))
  await axios.get(APIURL, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('webdev:alpdev').toString("base64") // this is needed for dev
    }
  }).then(async (response) => {
    const xmlData = await convert.xml2json(response.data, {
      compact: true,
      space: 4
    });
    const parsedData = JSON.parse(xmlData)
    // console.log(parsedData)
    res.json({
      ...JSON.parse(xmlData)
    })
  })
    .catch((error) => {
      console.log(error)
      res.json({
        status: 'error'
      })
    });
};

exports.getInventoryById = async (req, res) => {
  const API_BASE_URL = ALPHA_BRODER_URL_ONLINE
  const API_CREDENTIALS = `userName=${ALPHA_USER}&password=${ALPHA_PASS}`
  const sku = req.headers.itemid;
  const sql = `SELECT * FROM dbo.tblSkus WHERE [Vendor] = 'AlphaBroder' AND [Sku] = '${sku}'`;
  const headers = { 'Authorization': 'Basic ' + Buffer.from('webdev:alpdev').toString("base64") } //this is needed for dev

  connection.query(sql, (err, rows) => {
    console.log('sql', sql)
    console.log('err', err)
    console.log('rows', rows)
    if (err instanceof Error || rows?.recordset?.length == 0) {
      console.log(err);
      res.json({ status: 'error' })
    } else {
      let itemNumbers = [];
      rows?.recordset[0]?.ItemNumber2 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber2) : null;
      rows?.recordset[0]?.ItemNumber3 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber3) : null;
      rows?.recordset[0]?.ItemNumber4 ? itemNumbers.push(rows?.recordset[0]?.ItemNumber4) : null;

      let APIURL = API_BASE_URL + API_CREDENTIALS + '&in1=' + rows?.recordset[0]?.ItemNumber1 + '&pr=y';
      axios.get(APIURL, { headers })
        .then(async (response) => {
          if (response !== null) {
            const xmlData = await convert.xml2json(response.data, {
              compact: true,
              space: 4
            });
            res.json({
              ...JSON.parse(xmlData),
              itemNumbers,
              status: "success"
            })
          } else {
            res.json({ status: 'error' })
          }
        }).catch((error) => {
          res.json({ status: 'error' })
        });
    }
  });
};

exports.createPo = async (req, res) => {
  // console.log(req.headers.orderfile)
  // res.send("success")
  // const csvHeader = "3451167,PO-test-7,UPS-Surface,B11120108,,10,8,1,ABC Company,Sohail A Butt,86 lackawanna ave,,woodland Park,NJ,07424,PH,,,N,,sabdullah369@gmail.com";
  const csvHeader = req.headers.orderfile;
  await fs.promises.writeFile('myfile.csv', csvHeader);

  var data = new FormData();
  data.append('userName', '176544677');
  data.append('cn', '3451167');
  data.append('password', 'AB123456');
  data.append('FILE1', fs.createReadStream("myfile.csv"));

  var config = {
    method: 'post',
    url: 'https://dev.alphabroder.com/cgi-bin/orderUploadFile.cgi',
    headers: {
      'Authorization': 'Basic d2ViZGV2OmFscGRldg==',
      ...data.getHeaders()
    },
    data: data
  };

  axios(config)
    .then(async function (response) {
      console.log("here")
      const xmlData = await convert.xml2json(response.data, {
        compact: true,
        space: 4
      });
      res.json({
        status: "success",
        ...JSON.parse(xmlData)
      });
    })
    .catch(function (error) {
      console.log(error);
      res.json({ status: "error" });
    });
};