module.exports = (sequelize, DataTypes) => {
  const AlbPoCompleted = sequelize.define("AlbPoCompleted", {
    creditcard:{  type:DataTypes.STRING },
    orderreferenceno:{  type:DataTypes.STRING },
    responsecode:{  type:DataTypes.STRING },
    customerpo:{  type:DataTypes.STRING },
    freighttotal:{  type:DataTypes.DOUBLE },
    taxtotal:{  type:DataTypes.DOUBLE },
    coupon:{  type:DataTypes.STRING },
    ordervalue:{  type:DataTypes.DOUBLE },
    address:{  type:DataTypes.JSON },
    shipmethod:{  type:DataTypes.JSON },
  })
  return AlbPoCompleted;
}