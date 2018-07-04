
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

var exports = module.exports = {};

var mysql = require('mysql');
var db = require("./database.js");
var constants = require("../config/constants.js");

exports.createConnection = function() {
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : constants.DB_USER,
      password : constants.DB_PASSWORD
    });
    return connection;
}

exports.dbOperation = function(sql) {
    var conn = db.createConnection();
    var asyncOperation = function(resolve, reject) {
        conn.connect(function(err) {
            if (err) {
                console.log("******** ERROR: dbOperation *********");
                reject(err);
            }
            console.log("Connected!");
            
            conn.query(sql, function(err, result) {
                if (err) {
                    console.log("******** ERROR: dbOperation-query *********");
                    reject(err);
                } else {
                    console.log("******** SUCCESS: dbOperation-query *********");
                    resolve(result);
                }
            });            
            conn.end();
        });
    }
    return new Promise(asyncOperation);
}

