module.exports = (sequelize, DataTypes) => {
    const Tokens = sequelize.define("Tokens", {
        access_token:{
            type:DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        refresh_token:{
            type:DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
    })
    return Tokens;
}