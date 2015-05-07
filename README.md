# Cloudant Node.js Library - PROVISIONAL

This repository is a demonstration of what could be used instead of the existing Cloudant Node.js library. It has the following advantages:

* it is a thing wrapper around Nano (the official CouchDB Node.js library)
* Nano is a direct dependency of this library. If Nano changes, we simply change the dependent version, retest and republish
* it defers to Nano for almost everything; it has the same method of initialsation and returns a Nano object
* if the URL used at configure the library ends in "cloudant.com", we add additional functions that are specifc to Cloudant

e.g.

# Using the library

```
var cloudant = require('./cloudant.js')("https://MYUSERNAME:MYPASSWORD@MYACCOUNT.cloudant.com");
```

or 

```
var obj = { account: "MYACCOUNT", password: "MYPASSWORD"};
var cloudant = require('./cloudant.js)(obj);
```

## Generating a Cloudant API Key

```
// create an API key
cloudant.generateAPIKey(function(err, data) {
  console.log(data);
});
// { password: 'aPio3N4FSUXbLIcl2gnCjRcM', ok: true, key: 'gewgigbwifmwugw' }
```

## Getting the security settings for a database

```
// see who has access to a specific database
cloudant.getSecurity("mydatabase", function(err, data) {
  console.log(data);
});
// { cloudant: { nobody: [ '_reader' ], myaccount: [ '_reader', '_writer', '_admin', '_replicator' ] } }
```

## Setting the security settings for a database

```
// define who has access to a specific database
var permissions =  { nobody: [ '_reader' ], myaccount: [ '_reader', '_writer', '_admin', '_replicator' ] };
cloudant.setSecurity("mydatabase", permissions, function(err, data) {
  console.log(data);
});
// { ok: true }
```

## Getting the CORS configuration for an account

```
// get CORS configuration
cloudant.getCORS(function(err, data) {
  console.log(data);
});
// { enable_cors: true, allow_credentials: true, origins: [ '*' ] }
```

## Setting the CORS configuration for an account

```
// set CORS configuration
var configuration = { enable_cors: true, allow_credentials: true, origins: [ '*' ] };
cloudant.setCORS(configuration, function(err,data) {
  console.log(err, data)
});
// { ok: true }
```
