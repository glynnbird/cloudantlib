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

// function from the old Cloudant library to parse an object { account: "myaccount", password: "mypassword"}
var reconfigure = function (config) {
  config = JSON.parse(JSON.stringify(config));

  // An account can be just the username, or the full cloudant URL.
  var match = config.account && config.account.match && config.account.match(/(\w+)\.cloudant\.com/);
  if (match)
    config.account = match[1];

  // The username is the account ("foo" for "foo.cloudant.com") or the third-party API key.
  var username = config.key || config.account;

  // Configure for Cloudant, either authenticated or anonymous.
  if (config.account && config.password)
    config.url = 'https://' + encodeURIComponent(username) + ':' + encodeURIComponent(config.password) + '@' + encodeURIComponent(config.account) + '.cloudant.com';
  else if (config.account)
    config.url = 'https://' + encodeURIComponent(config.account) + '.cloudant.com';

  return config.url;
}



// this IS the Cloudant library. It's nano + a few functions
module.exports = function(credentials) {
  
  // keep a copy of the credentials
  if (typeof credentials == "object") {
    credentials = reconfigure(credentials);
  }
  cloudant_url = url.parse(credentials);
  
  // create a nano instance
  var nano = require('nano')(credentials);  
  
  // our own implementation of 'use' e.g. nano.use or nano.db.use
  // it includes all db-level functions
  var use = function(db) {
    
    // https://docs.cloudant.com/api.html#viewing-permissions
    var getSecurity = function(callback) {
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
    var setSecurity = function(permissions,callback) {
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
  
    // add Cloudant special functions
    var obj = nano._use(db);
    obj.getSecurity = getSecurity;
    obj.setSecurity = setSecurity;
    
    return obj;
  };
  
  // intercept calls to nano.use to plugin our extensions
  nano._use = nano.use;
  delete nano.use;
  delete nano.db.use;
  nano.use = nano.db.use = use;

  // add top-level Cloudant-specific functions
  if (cloudant_url.host.match(/cloudant\.com$/)) {
    nano.generateAPIKey = generateAPIKey;
    nano.getCORS = getCORS;
    nano.setCORS = setCORS;
  }
  
  return nano;
}