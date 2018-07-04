/***
 * author: Tushar Bochare
 * Email: mytusshar@gmail.com
 */

/** database parameters */
exports.DB_USER = "root";
exports.DB_PASSWORD = "root";
exports.DB_TABLE_NAME = "tokens";
exports.DB_DATABASE_NAME = "catalyst";

/******** DON'T CHNAGE THE FOLLOWING PARAMETERES  *******/

/** API credentials */
exports.APP_ID = "4d4f434841-373836313836303830-3430-616e64726f6964";
exports.APP_URL = "https://test.domain.com/2.1";

/** domain name */
exports.ISSUER = "www.domain.com";

/** request type */
exports.INVITE_GENERATE = 0;
exports.INVITE_DISABLE = 1;
exports.INVITE_VALIDATE = 2;
exports.INVITE_GET_ALL = 4;
exports.CREATE_DB = 5;
exports.CREATE_TABLE = 6;