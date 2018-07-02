
"use strict";

var app = require("express")();
var swaggerTools = require("swagger-tools");
var YAML = require("yamljs");
var cors = require('cors');
var auth = require("./api/helpers/auth");
var controller = require("./api/controllers/main-controller");
var swaggerConfig = YAML.load("./api/swagger/swagger2.yaml");

swaggerTools.initializeMiddleware(swaggerConfig, function(middleware) {
  //Serves the Swagger UI on /docs
  app.use(cors());

  app.use(middleware.swaggerMetadata()); // needs to go BEFORE swaggerSecurity
  
  app.use(
    middleware.swaggerSecurity({
      //manage token function in the 'auth' module
      Bearer: auth.verifyToken
    })
  );
  
  var routerConfig = {
    controllers: "./api/controllers",
    useStubs: false
  };

  app.use(middleware.swaggerRouter(routerConfig));

  app.use(middleware.swaggerUi());
  
  app.listen(3000, function() {
    console.log("Started server on port 3000");
    controller.initInMemoryTokens();
  });
});
