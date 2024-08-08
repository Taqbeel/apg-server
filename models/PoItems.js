module.exports = (sequelize, DataTypes) => {
    const PoItems = sequelize.define("PoItems", {
        itemNo:{  type:DataTypes.STRING },
        styleNo:{  type:DataTypes.STRING },
        colorNo:{  type:DataTypes.STRING },
        sizeNo:{  type:DataTypes.STRING },
        qty:{  type:DataTypes.STRING },
        shipToCompany:{  type:DataTypes.STRING },
        shipToAttention:{  type:DataTypes.STRING },
        shipToStreet1:{  type:DataTypes.STRING },
        shipToStreet2:{  type:DataTypes.STRING },
        shipToCity:{  type:DataTypes.STRING },
        shipToState:{  type:DataTypes.STRING },
        shipToPostal:{  type:DataTypes.STRING },
        wareHouse:{  type:DataTypes.STRING },
        shortShip:{  type:DataTypes.STRING },
        splitShip:{  type:DataTypes.STRING },
        customerEmail:{  type:DataTypes.STRING },
        customerPhone:{  type:DataTypes.STRING }
    })
    return PoItems;
}