const { DataTypes } = require('sequelize');
const { Orders, Users, OrderItems, OrderShipment, AlbPurchaseOrder } = require("../models");

Orders.hasMany(OrderItems,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
OrderItems.belongsTo(Orders);

AlbPurchaseOrder.hasOne(OrderItems,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
OrderItems.belongsTo(AlbPurchaseOrder);

Orders.hasOne(OrderShipment,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
OrderShipment.belongsTo(Orders);

Users.hasMany(Orders,{
  foriegnKey:{
    type: DataTypes.INTEGER
  }
});
Orders.belongsTo(Users);

module.exports = { Users, Orders, OrderItems, OrderShipment }