var url = require('url'),
 request = require('request'),
 cloudant_url = null;

// https://docs.cloudant.com/api.html#creating-api-keys
var generateAPIKey = function(callback) {
  var obj = {
    protocol: cloudant_url.protocol,
    auth: cloudant_url.auth,
    slashes: true,
    host: "cloudant.com",
    pathname: "/api/generate_api_key"
  };
  request.post({ url: url.format(obj), json:true}, function(err, req, body) {
    callback(err, body);
  });
};

// https://docs.cloudant.com/api.html#viewing-permissions
var getSecurity = function(db, callback) {
  var account = cloudant_url.auth.split(":")[0];
  var obj = {
    protocol: cloudant_url.protocol,
    auth: cloudant_url.auth,
    slashes: true,
    host: account + ".cloudant.com",
    pathname: "/_api/v2/db/" + encodeURIComponent(db) + "/_security"
  };
  request.get({ url: url.format(obj), json:true}, function(err, req, body) {
    callback(err, body);
  });
};

// https://docs.cloudant.com/api.html#modifying-permissions
var setSecurity = function(db, permissions,callback) {
  var account = cloudant_url.auth.split(":")[0];
  var obj = {
    protocol: cloudant_url.protocol,
    auth: cloudant_url.auth,
    slashes: true,
    host: account + ".cloudant.com",
    pathname: "/_api/v2/db/" + encodeURIComponent(db) + "/_security"
  };
  request.put({ url: url.format(obj) , json: true, body: {cloudant: permissions} }, function(err, req, body) {
    callback(err, body);
  });
};

// https://docs.cloudant.com/api.html#reading-the-cors-configuration
var getCORS = function(callback) {
  var account = cloudant_url.auth.split(":")[0];
  var obj = {
    protocol: cloudant_url.protocol,
    auth: cloudant_url.auth,
    slashes: true,
    host: account + ".cloudant.com",
    pathname: "/_api/v2/user/config/cors"
  };
  request.get({ url: url.format(obj), json:true}, function(err, req, body) {
    callback(err, body);
  });
};

// https://docs.cloudant.com/api.html#setting-the-cors-configuration
var setCORS = function(configuration, callback) {
  var account = cloudant_url.auth.split(":")[0];
  var obj = {
    protocol: cloudant_url.protocol,
    auth: cloudant_url.auth,
    slashes: true,
    host: account + ".cloudant.com",
    pathname: "/_api/v2/user/config/cors"
  };
  request.put({ url: url.format(obj), json:true, body: configuration}, function(err, req, body) {
    callback(err, body);
  });
};

module.exports = function(credentials) {
  
  // keep a copy of the credentials
  if (typeof credentials == "string") {
    cloudant_url = url.parse(credentials);
  }
  
  // create a nano instance
  var nano = require('nano')(credentials);  
  
  // add Cloudant-specific functions
  if (cloudant_url.host.match(/cloudant\.com$/)) {
    nano.generateAPIKey = generateAPIKey;
    nano.getSecurity = getSecurity;
    nano.setSecurity = setSecurity;
    nano.getCORS = getCORS; 
    nano.setCORS = setCORS;
  }
  
  return nano;
}