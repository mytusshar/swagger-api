/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

"use strict";

var jwt = require("jsonwebtoken");
var constants = require("../config/constants.js");
var sharedSecret = "secret";

exports.verifyToken = function(req, authOrSecDef, token, callback) {
    var currentScopes = req.swagger.operation["x-security-scopes"];

    function sendError() {
        return req.res.status(403).json({ message: "Error: Access Denied" });
    }

    if (token && token.indexOf("Bearer ") == 0) {
        var tokenString = token.split(" ")[1];

        jwt.verify(tokenString, sharedSecret, function(verificationError, decodedToken) {
            if (verificationError == null && Array.isArray(currentScopes) && decodedToken && decodedToken.role) {
                // check if the role is valid for this endpoint
                var roleMatch = currentScopes.indexOf(decodedToken.role) !== -1;
                // check if the issuer matches
                var issuerMatch = decodedToken.iss == constants.ISSUER;

                if (roleMatch && issuerMatch) {
                    req.auth = decodedToken;
                    return callback(null);
                } else {
                    return callback(sendError());
                }
            } else {
                return callback(sendError());
            }
        });
    } else {
        return callback(sendError());
    }
};

exports.issueToken = function(username, role) {
    var token = jwt.sign({
        sub: username,
        iss: constants.ISSUER,
        role: role
    }, sharedSecret);
    return token;
};
