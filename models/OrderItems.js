module.exports = (sequelize, DataTypes) => {
  const OrderItems = sequelize.define("OrderItems", {
    TaxCollection: { type: DataTypes.JSON },
    ProductInfo: { type: DataTypes.JSON },
    CurrencyCode: { type: DataTypes.JSON },
    TaxAmount: { type: DataTypes.DOUBLE },
    QuantityShipped: { type: DataTypes.INTEGER },
    BuyerRequestedCancel: { type: DataTypes.JSON },
    ItemPriceAmount: { type: DataTypes.DOUBLE },
    ASIN: { type: DataTypes.STRING },
    SellerSKU: { type: DataTypes.STRING },
    Title: { type: DataTypes.STRING },
    IsGift: { type: DataTypes.BOOLEAN },
    ConditionSubtypeId: { type: DataTypes.STRING },
    IsTransparency: { type: DataTypes.BOOLEAN },
    QuantityOrdered: { type: DataTypes.INTEGER },
    PromotionDiscountTax: { type: DataTypes.DOUBLE },
    ConditionId: { type: DataTypes.STRING },
    PromotionDiscountAmount: { type: DataTypes.DOUBLE },
    OrderItemId: { type: DataTypes.STRING },
    AmazonOrderId: { type: DataTypes.STRING },
    itemFetched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: 'unfetched'
    },
    weight: { type: DataTypes.JSON },
    dimensions: { type: DataTypes.JSON },
    isAlpha: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    alphaId: { type: DataTypes.STRING },
    priceFetched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    inventoryReceived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },  
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expectedDelivery: {
      type: DataTypes.DATE,
      allowNull: true
    },
    poNumber: {
      type: DataTypes.STRING,
      allowNull: true
    }
  })
  return OrderItems;
}