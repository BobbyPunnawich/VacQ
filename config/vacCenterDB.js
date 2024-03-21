const mysql = require('mysql');

var connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123',
    database: 'vacCenter'
})

module.exports = connection;