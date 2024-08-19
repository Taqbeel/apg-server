module.exports = (sequelize, DataTypes) => {
  const Orders = sequelize.define("Orders", {
    AmazonOrderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    ShipmentServiceLevelCategory: { type: DataTypes.STRING },
    FulfillmentChannel: { type: DataTypes.STRING },
    ShipServiceLevel: { type: DataTypes.STRING },
    MarketplaceId: { type: DataTypes.STRING },
    PaymentMethod: { type: DataTypes.STRING },
    SalesChannel: { type: DataTypes.STRING },
    CurrencyCode: { type: DataTypes.STRING },
    OrderStatus: { type: DataTypes.STRING },
    OrderType: { type: DataTypes.STRING },

    BuyerInfo: { type: DataTypes.JSON },
    OrderTotal: { type: DataTypes.JSON },
    PaymentMethodDetails: { type: DataTypes.JSON },
    AutomatedShippingSettings: { type: DataTypes.JSON },
    ShippingAddress: { type: DataTypes.JSON },

    NumberOfItemsUnshipped: { type: DataTypes.INTEGER },
    NumberOfItemsShipped: { type: DataTypes.INTEGER },
    Amount: { type: DataTypes.DOUBLE },

    IsGlobalExpressEnabled: { type: DataTypes.BOOLEAN },
    IsReplacementOrder: { type: DataTypes.BOOLEAN },
    IsAccessPointOrder: { type: DataTypes.BOOLEAN },
    HasRegulatedItems: { type: DataTypes.BOOLEAN },
    IsBusinessOrder: { type: DataTypes.BOOLEAN },
    IsPremiumOrder: { type: DataTypes.BOOLEAN },
    IsSoldByAB: { type: DataTypes.BOOLEAN },
    IsPrime: { type: DataTypes.BOOLEAN },
    IsISPU: { type: DataTypes.BOOLEAN },

    //dates
    EarliestDeliveryDate: { type: DataTypes.DATE },
    LatestDeliveryDate: { type: DataTypes.DATE },
    EarliestShipDate: { type: DataTypes.DATE },
    LatestShipDate: { type: DataTypes.DATE },
    PurchaseDate: { type: DataTypes.DATE },
    shipmentBought: { type: DataTypes.BOOLEAN },
    vendorName: { type: DataTypes.STRING },

    itemsFetched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: { type: DataTypes.STRING },
  })
  return Orders;
}