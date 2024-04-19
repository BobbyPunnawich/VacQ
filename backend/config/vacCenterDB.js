const mysql = require("mysql");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123",
  database: "vacCenter",
});

module.exports = connection;
