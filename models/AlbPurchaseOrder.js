module.exports = (sequelize, DataTypes) => {
    const AlbPurchaseOrder = sequelize.define("AlbPurchaseOrder", {
        customerName:{  type:DataTypes.STRING },
        customerPo:{  type:DataTypes.STRING },
        poNo:{  type:DataTypes.INTEGER },
        carrier:{  type:DataTypes.STRING },
        total:{  type:DataTypes.DOUBLE },
        isComplete:{  type:DataTypes.BOOLEAN },
    })
    return AlbPurchaseOrder;
}