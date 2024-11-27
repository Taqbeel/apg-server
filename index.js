const express = require("express");

const cors = require('cors');
const morgan = require('morgan');

const app = express();
const db = require("./models");
const bodyParser = require('body-parser');
const connection = require("./connection.js")

const authRoutes = require('./routes/auth/');
const usersRoutes = require('./routes/users/');
const ordersRoutes = require('./routes/orders/');
const shippingRoutes = require('./routes/shipping/');
const trackingRoutes = require('./routes/tracking/');
const poRoutes = require('./routes/purhcaseOrder/');
const alphaRoutes = require('./routes/alpha/');
const testRoutes = require('./routes/test/');

const { Users, Orders, OrderItems, OrderShipment } = require("./associations/orderAssociations");
const { AlbPurchaseOrder, PoItems, AlbShippingBox, AlbPoCompleted } = require("./associations/poAssociations");
const { CONFIG_USER, CONFIG_PASS, CONFIG_SERVER, CONFIG_DB_NAME, HOST_PORT, } = require("./config/config.js");

app.use(cors({ origin: '*' }));
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(bodyParser.json({ limit: '100mb', extended: true }));
app.use(express.json());
db?.sequelize?.sync();

const config = {
  "user": CONFIG_USER, // Database username
  "password": CONFIG_PASS, // Database password
  "server": CONFIG_SERVER, // Server IP address
  "port": 1433,
  "database": CONFIG_DB_NAME, // Database name
  "options": {
    "encrypt": true,
    "trustServerCertificate": true
  }
};

connection.connect(config, err => {
  if (err) throw err;
  console.log("Connection Successful!");
});

// app.get("/", async(req, res) => res.json({status:'Error'}));
app.get("/", (req, res) => {
  // const sql = "SELECT * FROM dbo.tblSkus WHERE [Sku] = 'AUG-502905064-651AFM'";
  // // const sql = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'"; //<<---- Query to access every table
  // connection.query(sql, (err, rows) => {
  //   if (err instanceof Error) {
  //     console.log(err);
  //     return;
  //   }
  //   console.log(rows);
  // });
  res.send("ok");
});

app.use("/po", poRoutes);
app.use("/test", testRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/alpha", alphaRoutes);
app.use("/orders", ordersRoutes);
app.use("/shipping", shippingRoutes);
app.use("/tracking", trackingRoutes);

const PORT = HOST_PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});