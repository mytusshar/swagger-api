
var auth = require("../helpers/auth");
var db = require("../db/database.js");
var controller = require("./main-controller.js");

const APP_ID = "4d4f434841-373836313836303830-3430-616e64726f6964";
const APP_URL = "https://test.pulseid.com/2.1";
var inMemoryTokens;

exports.updateInMemoryTokens = function(data, operation) {
  inMemoryTokens[data.token] = data.expiry_date;
  var keys = Object.keys(inMemoryTokens);
  console.log("InmemorySIZE: ", keys.length);
}

exports.initInMemoryTokens = function() {
  console.log("*********** initInMemoryTokens ***********");
  var response;
  var promise = db.readDB();
  promise.then(function(data) {
    console.log("***** RESOLVED initInMemoryTokens: ");
    var arr = data;
    inMemoryTokens = arr.reduce(function(map, obj) {
      map[obj.token] = obj.expiry_date;
      return map;
    }, {});
    // console.log(inMemoryTokens);

  }, function(err) {
      console.log("***** ERROR: REJECTED initInMemoryTokens: ", err);
  });
}

exports.unprotectedGet = function(args, res, next) {
  var response = { message: "My resource!" };
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(response));
};

exports.protectedGet = function(args, res, next) {
  var response = { message: "My protected resource for admins and users!" };
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(response));
};

exports.protected2Get = function(args, res, next) {
  var response = { message: "My protected resource for admins!" };
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(response));
};

exports.loginPost = function(args, res, next) {
  var role = args.swagger.params.role.value;
  var username = args.body.username;
  var password = args.body.password;

  console.log("login request");

  if (role != "user" && role != "admin") {
    var response = { message: 'Error: Role must be either "admin" or "user"' };
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(response));
  }

  if (username == "admin" && password == "admin" && role) {
    var tokenString = auth.issueToken(username, role);
    var response = {
      token: tokenString,
      appID: APP_ID,
      appURL: APP_URL
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(response));
  } else {
    var response = { message: "Error: Credentials incorrect" };
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(response));
  }
};



exports.createTokenAdmin = function(args, res, next) {
  console.log("*****createTokenAdmin*****");

  var appId = args.body.appId;
  var clienId = args.body.clientId;
  var userId = args.body.userId;
  var appUrl = args.body.appUrl;
  console.log("body param: ", args.body);

  var data = db.createInviteToken();
  console.log("data: ", data);
  var response;
  var promise = db.insertDB(data.token, data.exp_date);
  promise.then(function(newToken) {
      console.log("***** RESOLVED insertDB: ", newToken);

      // insert newToken into inMemoryTokens
      controller.updateInMemoryTokens(data);

      response = {newInviteToken: newToken};
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
  }, function(err) {
      console.log("***** ERROR: REJECTED insertDB: ", err);
      response = {message: "Internal Server error!"};
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
  });
};

exports.invalidateInviteToken = function(args, res, next) {
  console.log("*****invalidateTokenAdmin*****");
  var token = args.body.inviteToken;
  console.log("token: ", token);
  var response;
  var promise = db.invalidateInviteToken(token);
  promise.then(function(result) {
      console.log("***** RESOLVED invalidateInviteToken: ", result);

      // update newToken into inMemoryTokens
      controller.updateInMemoryTokens(result);

      response = {message: result.message};
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
  }, function(err) {
      console.log("***** ERROR: REJECTED invalidateInviteToken: ", err);
      response = {message: "Internal Server error!"};
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
  });
};

exports.getAllTokensAdmin = function(args, res, next) {
  console.log("*****getAllTokensAdmin*****");
  // var response = {data: inMemoryTokens};
  // res.writeHead(200, { "Content-Type": "application/json" });

  // var keys = Object.keys(inMemoryTokens);
  // console.log("******* getAllTokensAdmin: ", keys.length);
  // return res.end(JSON.stringify(response));


  var response;
  var promise = db.readDB();
  promise.then(function(data) {
      console.log("***** RESOLVED readDB: ");
      response = {allTokens: data};
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
  }, function(err) {
      console.log("***** ERROR: REJECTED readDB: ", err);
      response = {message: "Internal Server error!"};
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(response));
  });
};

exports.validateInviteToken = function(args, res, next) {
  console.log("*****validateInviteToken*****");
  var token = args.body.inviteToken;
  console.log("token: ", token);
  var response;
  var promise = db.checkValidInviteToken(token);
  promise.then(function(data) {
    if(data.length > 0) {
      var expDate = data[0].expiry_date;
      var curDate = new Date();
      var isValidToken = Date.parse(expDate) > curDate ? true : false;
      if(isValidToken) {
        var tokenString = auth.issueToken("username", "user");
        var msgString = "You are successfully logged in! Check the JWT Token in Console,"
                        + " use it for subsuquent operations on Pulse-ID platform.";
        response = {
          appId: APP_ID,
          appUrl: APP_URL,
          message: msgString, 
          jwtToken: tokenString 
        };
        res.writeHead(200, { "Content-Type": "application/json" });
        controller.makeTokenInvalid(token);
      } else {
        response = { message: "Token Expired!" };
        res.writeHead(401, { "Content-Type": "application/json" });
      }      
      console.log("****** valid: " + isValidToken + " ******");
    } else {
      response = { message: "No such token!" };
      console.log("****** No such token! ******");
    }
    return res.end(JSON.stringify(response));
  }, function(err) {
    console.log("***** ERROR: REJECTED validateInviteTokenDB: ", err);
    response = {message: "Internal Server error!"};
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(response));
  });
};

exports.makeTokenInvalid = function(token) {
  var promise = db.invalidateInviteToken(token);
  promise.then(function(result) {
      console.log("***** RESOLVED makeTokenInvalid: ", result);

      // update newToken into inMemoryTokens
      controller.updateInMemoryTokens(result);

  }, function(err) {
      console.log("***** ERROR: REJECTED makeTokenInvalid: ", err);
  });
}