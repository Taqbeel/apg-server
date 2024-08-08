module.exports = (sequelize, DataTypes) => {
  const AlbShippingBox = sequelize.define("AlbShippingBox", {
    style:{  type:DataTypes.STRING },
    description:{  type:DataTypes.STRING },
    color:{  type:DataTypes.STRING },
    size:{  type:DataTypes.STRING },
    pieces:{  type:DataTypes.STRING },
    price:{  type:DataTypes.STRING },
    amount:{  type:DataTypes.STRING },
    warehouse:{  type:DataTypes.STRING },
    weight:{  type:DataTypes.STRING },
    itemcode:{  type:DataTypes.STRING },
    upccode:{  type:DataTypes.STRING },
    shippernumber:{  type:DataTypes.STRING },
    shipstatus:{  type:DataTypes.STRING },
  })
  return AlbShippingBox;
}