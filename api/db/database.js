
var exports = module.exports = {};

var mysql = require('mysql');
var randtoken = require('rand-token');
var db = require("./database.js");

exports.createInviteToken = function() {
    var token = randtoken.generate(12);
    var date = new Date();
    date.setDate(date.getDate() + 7);
    console.log("token: ", token);
    console.log("expiry_time: ", date);
    console.log("************");
    return {token: token, exp_date: date};
}

exports.checkValidInviteToken = function(token) {
    
    var conn = db.createConnection();
    var sql = "SELECT expiry_date FROM tokens where token='" + token + "'";

    var asyncOperation = function(resolve, reject) {
        conn.connect(function(err) {
            if (err) {
                console.log("******** ERROR: checkValidInviteTokenDB *********");
                reject(err);
            }
            console.log("Connected!");
            
            conn.query(sql, function(err, data, fields) {
                if (err) {
                    console.log("******** ERROR: checkValidInviteTokenDB *********");
                    reject(err);
                }
                console.log("token exp. date: ", data);
                resolve(data);
            });        
            conn.end();
        });
    }
    return new Promise(asyncOperation);
}

exports.invalidateInviteToken = function(token) {
    var conn = db.createConnection();
    // var sql = "DELETE FROM tokens where token='" + token + "'";
    var date = new Date();
    date.setDate(date.getDate() - 7);
    var sql = "UPDATE tokens SET expiry_date = '" + date + "' WHERE token = '" + token + "'";

    var asyncOperation = function(resolve, reject) {
        conn.connect(function(err) {
            if (err) {
                console.log("******** ERROR: invalidateInviteTokenDB *********");
                reject(err);
            }
            console.log("Connected!");
            
            conn.query(sql, function(err, data) {
                if (err) {
                    console.log("******** ERROR: invalidateInviteTokenDB-query *********");
                    reject(err);
                } else {
                    console.log("rows updated: ", data.affectedRows);
                    result = data.affectedRows > 0 ? "successfully invalidated" : "no such token found";
                    console.log("****** " + result + " ******");
                    var data = {
                        message: result,
                        token: token,
                        expiry_date: date
                    };
                    resolve(data);
                }
            });          
            conn.end();
        });
    }
    return new Promise(asyncOperation);
}

exports.createConnection = function() {
    var connection = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : 'root',
      database : 'pulseid'
    });
    return connection;
}

exports.readDB = function() {
    var conn = db.createConnection();
    var sql = "SELECT * FROM tokens";

    var asyncOperation = function(resolve, reject) {
        conn.connect(function(err) {
            if (err) {
                console.log("******** ERROR: readDB *********");
                reject(err);
            }
            console.log("Connected!");
            
            conn.query(sql, function(err, result) {
                if (err) {
                    console.log("******** ERROR: readDB-query *********");
                    reject(err);
                } else {
                    // console.log("readDB: " + result);
                    console.log("************");
                    resolve(result);
                }
            });          
            conn.end();
        });
    }
    return new Promise(asyncOperation);
}

exports.insertDB = function(token, date) {
    var conn = db.createConnection();
    var sql = "INSERT INTO tokens (token, expiry_date)" 
              + " VALUES ('" + token + "', '" + date + "')";

    var asyncOperation = function(resolve, reject) {
        conn.connect(function(err) {
            if (err) {
                console.log("******** ERROR: insertDB *********");
                reject(err);
                // throw err;
            }
            console.log("Connected!");
            
            conn.query(sql, function(err, result) {
                if (err) {
                    console.log("******** ERROR: insertDB-query *********");
                    reject(err);
                } else {
                    console.log("token inserted: " + token);
                    console.log("************");
                    resolve(token);
                }
            });            
            conn.end();
        });
    }
    return new Promise(asyncOperation);
}