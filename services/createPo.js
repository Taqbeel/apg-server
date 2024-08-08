const { Op } = require('sequelize');
const { AlbPurchaseOrder, PoItems } = require("../associations/poAssociations");
const fetchAlbpPrices = require("../services/fetchAlbpPrices");
const dayjs = require('dayjs');

module.exports = createPo = async() => {
  const check = await AlbPurchaseOrder.findOne({
    order:[["poNo","DESC"]],
    attributes:["poNo"],
  });
  const poNo = check? check?.dataValues?.poNo + 1: 1
  AlbPurchaseOrder.create({
    customerName:'3451167',
    poNo:poNo,
    customerPo:`PO-${dayjs().format("MM-DD-")}${poNo}`,
    carrier:'UPS-Surface',
    total:0,
    isComplete:false,
  }).then((x)=>{
    // console.log(x.dataValues.id)
    fetchAlbpPrices(x.dataValues.id)
  })
};