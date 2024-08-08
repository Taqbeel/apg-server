const routes = require('express').Router();
const FormData = require('form-data');
const convert = require('xml-js');
const axios = require('axios');
const fs = require('fs');
const fetchAlbpPrices = require("../../services/fetchAlbpPrices");
const createPo = require("../../services/createPo");
const uploadPo = require("../../services/uploadPo");

routes.get("/testingPriceFetch", (req, res)=>{
  fetchAlbpPrices()
  res.send("get ok");
});

routes.get("/testingCreatePo", (req, res)=>{
  createPo()
  res.send("get ok");
});

routes.get("/testingUploadPo", uploadPo);

routes.post("/testing", async(req, res) => {

  const csvHeader = "3451167,PO-test-6,UPS-Surface,B11120108,,10,8,1,ABC Company,Sohail A Butt,86 lackawanna ave,,woodland Park,NJ,07424,PH,,,N,,sabdullah369@gmail.com";
  await fs.promises.writeFile('myfile.csv', csvHeader);

  var data = new FormData();
  data.append('userName', '176544677');
  data.append('cn', '3451167');
  data.append('password', 'AB123456');
  data.append('FILE1', fs.createReadStream("myfile.csv"));

  const config = {
    method: 'post',
    url: 'https://dev.alphabroder.com/cgi-bin/orderUploadFile.cgi',
    headers: {
      'Authorization': 'Basic d2ViZGV2OmFscGRldg==', 
      ...data.getHeaders()
    },
    data : data
  };

  axios(config)
  .then(async function (response) {
    const xmlData = await convert.xml2json(response.data, {
      compact: true,
      space: 4
    });
    res.json({
      status:"success",
      ...JSON.parse(xmlData)
    });
  })
  .catch(function (error) {
    console.log(error);
    res.json({ status:"error" });
  });
});

module.exports = routes;