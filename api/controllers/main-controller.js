
/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

"use strict";

var randtoken = require('rand-token');
var auth = require("../helpers/auth");
var db = require("../db/database.js");
var constants = require("../config/constants.js");
var controller = require("./main-controller.js");

var inMemoryTokens;

exports.initDatabaseIfNotAlready = function() {
	console.log("*********** initDatabaseIfNotAlready ***********");
	var sql = controller.generateSQL(constants.CREATE_DB);
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(result) {
		console.log("***** RESOLVED initDatabaseIfNotAlready:", result);
		console.log("*** Database created success ***");
		controller.createTable();
	}

	function errorCB(err) {
		console.log("***** ERROR: REJECTED initDatabaseIfNotAlready: ", err);
	}
}

exports.createTable = function() {
	console.log("*********** createTable ***********");
	var sql = controller.generateSQL(constants.CREATE_TABLE);
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(result) {
		console.log("***** RESOLVED createTable:", result);
		console.log("*** Table created success ***");
	}

	function errorCB(err) {
		console.log("***** ERROR: REJECTED createTable: ", err);
	}
}

exports.updateInMemoryTokens = function(data) {
	inMemoryTokens[data.token] = data.expiry_date;
	var keys = Object.keys(inMemoryTokens);
	console.log("InmemorySIZE: ", keys.length);
}

exports.initInMemoryTokens = function() {
	console.log("*********** initInMemoryTokens ***********");
	var sql = controller.generateSQL(constants.INVITE_GET_ALL);
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(arr) {
		console.log("***** RESOLVED initInMemoryTokens: ");
		inMemoryTokens = arr.reduce(function(map, obj) {
			map[obj.token] = obj.expiry_date;
			return map;
		}, {});
	}

	function errorCB(err) {
		console.log("***** ERROR: REJECTED initInMemoryTokens: ", err);
	}
}

exports.loginPost = function(args, res, next) {
	var role = args.swagger.params.role.value;
	var username = args.body.username;
	var password = args.body.password;
	var response;
	var httpCode;
	console.log("login request");

	if (username == "admin" && password == "admin" && role) {
		var tokenString = auth.issueToken(username, role);
		response = {
			token: tokenString,
			appID: constants.APP_ID,
			appURL: constants.APP_URL
		};
		httpCode = 200;
	} else {
		response = { message: "Error: Credentials incorrect" };
		httpCode = 403;
    }
    controller.sendResponse(res, httpCode, response);
};

exports.createTokenAdmin = function(args, res, next) {
	console.log("*****createTokenAdmin*****");
	var appId = args.body.appId;
	var clienId = args.body.clientId;
	var userId = args.body.userId;
	var appUrl = args.body.appUrl;
	var tokenData = controller.createInviteToken();
	var sql = controller.generateSQL(constants.INVITE_GENERATE, tokenData);

	console.log("body param: ", args.body);
	var response;
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(data) {
		console.log("***** RESOLVED dbOperation: ", data);
		if(data.affectedRows > 0) {
			response = {newInviteToken: tokenData.token};
		} else {
			response = {newInviteToken: "invite token generation failed!"};
		}
		controller.sendResponse(res, 200, response);
	}

	function errorCB(err) {
		console.log("***** REJECTED dbOperation: ", err);
		response = {message: "Internal Server error!"};
		controller.sendResponse(res, 500, response);
	}	
};

exports.invalidateInviteToken = function(args, res, next) {
	console.log("*****invalidateTokenAdmin*****");
	var token = args.body.inviteToken;
	console.log("token: ", token);
	var date = new Date();
	date.setDate(date.getDate() - 7);
	var data = {
		token: token,
		exp_date: date
	}
	var sql = controller.generateSQL(constants.INVITE_DISABLE, data);
	var response;
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(data) {
		console.log("***** RESOLVED invalidateInviteToken: ", data);
		var result = data.affectedRows > 0 ? "successfully invalidated" : "no such token found";
		console.log("****** " + result + " ******");
		response = {
			message: result,
			token: token,
			expiry_date: date
		};
		controller.sendResponse(res, 200, response);
	}

	function errorCB(err) {
		console.log("***** ERROR: REJECTED invalidateInviteToken: ", err);
		response = {message: "Internal Server error!"};
		controller.sendResponse(res, 500, response);
	}
};

exports.getAllTokensAdmin = function(args, res, next) {
	console.log("*****getAllTokensAdmin*****");
	var response;
	var sql = controller.generateSQL(constants.INVITE_GET_ALL);
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(data) {
		console.log("***** RESOLVED getAllTokens: ", data);
		response = {allTokens: data};
		controller.sendResponse(res, 200, response);
	}

	function errorCB(err) {
		console.log("***** REJECTED getAllTokens: ", err);
		response = {message: "Internal Server error!"};
		controller.sendResponse(res, 500, response);
	}
};

exports.validateInviteToken = function(args, res, next) {
	console.log("*****validateInviteToken*****");
	var token = args.body.inviteToken;
	console.log("token: ", token);

	var sql = controller.generateSQL(constants.INVITE_VALIDATE, token);
	var response;
	var httpCode;
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(data) {
		if(data.length > 0) {
			var expDate = data[0].expiry_date;
			var curDate = new Date();
			var isValidToken = Date.parse(expDate) > curDate ? true : false;
			if(isValidToken) {
				var tokenString = auth.issueToken("username", "user");
				var msgString = "You are successfully logged in! Check the JWT Token in Console,"
								+ " use it for subsuquent operations on Domain-Name platform.";
				response = { appId: constants.APP_ID, appUrl: constants.APP_URL, message: msgString, 
					jwtToken: tokenString 
				};
				httpCode = 200;
				controller.makeTokenInvalid(token);
			} else {
				response = { message: "Token Expired!" };
				httpCode = 401;
			}      
			console.log("****** valid: " + isValidToken + " ******");
		} else {
			response = { message: "No such token!" };
			console.log("****** No such token! ******");
			httpCode = 401;
		}
		controller.sendResponse(res, httpCode, response);
	}

	function errorCB(err) {
		console.log("***** ERROR: REJECTED validateInviteTokenDB: ", err);
		response = {message: "Internal Server error!"};
		controller.sendResponse(res, 500, response);
	}
};

exports.makeTokenInvalid = function(token) {
	var date = new Date();
	date.setDate(date.getDate() - 7);
	var data = {
		token: token,
		exp_date: date
	}
	var sql = controller.generateSQL(constants.INVITE_DISABLE, data);
	var promise = db.dbOperation(sql);
	promise.then(successCB, errorCB);

	function successCB(result) {
		console.log("***** RESOLVED makeTokenInvalid: ", result);
	}

	function errorCB(err) {
		console.log("***** ERROR: REJECTED makeTokenInvalid: ", err);
	}
}

exports.generateSQL = function(code, data) {
	var tableName = constants.DB_DATABASE_NAME + "." + constants.DB_TABLE_NAME;
	switch(code){
		case constants.INVITE_GENERATE:
			return "INSERT INTO " + tableName + " (token, expiry_date)" 
             	 + " VALUES ('" + data.token + "', '" + data.exp_date + "')";
		break;
		case constants.INVITE_DISABLE:
			return "UPDATE " + tableName + " SET expiry_date = '" + data.exp_date + "' WHERE token = '" + data.token + "'";
		break;
		case constants.INVITE_VALIDATE:
			return "SELECT expiry_date FROM " + tableName + " where token='" + data + "'";
		break;
		case constants.INVITE_GET_ALL:
			return "SELECT * FROM " + tableName;
		break;
		case constants.CREATE_DB:
			return "CREATE DATABASE " + constants.DB_DATABASE_NAME;
		break;
		case constants.CREATE_TABLE:
			return "CREATE TABLE " + tableName + " (token varchar(12), expiry_date varchar(100))";
		break;
		default: console.log("invalid request type");
	}
}

exports.sendResponse = function(res, httpCode, data) {
	res.writeHead(httpCode, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(data));
}

exports.createInviteToken = function() {
    var token = randtoken.generate(12);
    var date = new Date();
    date.setDate(date.getDate() + 7);
    console.log("token: ", token);
    console.log("expiry_time: ", date);
    console.log("************");
    return {token: token, exp_date: date};
}
