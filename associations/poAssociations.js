const { DataTypes } = require('sequelize');
const { AlbPurchaseOrder, PoItems, AlbShippingBox, AlbPoCompleted } = require("../models");

AlbPurchaseOrder.hasMany(PoItems,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
PoItems.belongsTo(AlbPurchaseOrder);

AlbPurchaseOrder.hasOne(AlbPoCompleted,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
AlbPoCompleted.belongsTo(AlbPurchaseOrder);

AlbPoCompleted.hasMany(AlbShippingBox,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
AlbShippingBox.belongsTo(AlbPoCompleted);

module.exports = { AlbPurchaseOrder, PoItems, AlbShippingBox, AlbPoCompleted };