module.exports = (sequelize, DataTypes) => {
  const OrderShipment = sequelize.define("OrderShipment", {
    shipmentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    trackingId: { type: DataTypes.STRING },
    packageClientReferenceId: { type: DataTypes.STRING },
    document: { type: DataTypes.TEXT },
    promise: { type: DataTypes.JSON },
    totalCharge: { type: DataTypes.STRING },
    chargeUnit: { type: DataTypes.STRING },
    format: { type: DataTypes.STRING },
  })
  return OrderShipment;
}