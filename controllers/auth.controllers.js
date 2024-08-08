const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const db = require("../models");
const amazonAuth = require("../services/amazonAuth");

const Op = Sequelize.Op;

exports.login = (req, res) => {
  const { password, username } = req.headers;
  db.Users.findOne({ where: { username: username, password: password } })
    .then((data) => {
      if (data) {
        const payload = {
          username: `${data.name}`,
          loginId: `${data.id}`,
          type: `${data.type}`,
        };
        jwt.sign(
          payload,
          "qwertyuiodoasjrfbheskfhdsxcvboiswueorghbfo3urbn23o9h9hjklzxcvbnm",
          { expiresIn: "12h" },
          (err, token) => {
            if (err) return res.json({ message: err });
            return res.json({
              status: "success",
              token: "BearerSplit" + token,
            });
          }
        );
      } else {
        return res.json({ status: "error" });
      }
    })
    .catch((err) => {
      res.json({
        status: "error",
        message:
          //err.message ||
          "Some error occurred while retrieving user.",
      });
    });
};

exports.verifyToken = (req, res) => {
  res.json({ status: "success", isAuthorized: true });
};

exports.verify = (req, res, next) => {
  const token = req.headers["x-access-token"]?.split("Split")[1];
  if (token) {
    jwt.verify(
      token,
      "qwertyuiodoasjrfbheskfhdsxcvboiswueorghbfo3urbn23o9h9hjklzxcvbnm",
      (err, decode) => {
        if (err) {
          return res.json({
            status: "error",
            isAuthorized: false,
            message: "Some Error Occured",
          });
        }
        req.user = {};
        req.user.id = decode.id;
        req.user.username = decode.username;
        next();
      }
    );
  } else {
    res.json({ status: "error" });
  }
};

exports.stsAuth = async(req, res) => {
  amazonAuth();
  return res.json({
    status: "done"
  });
};