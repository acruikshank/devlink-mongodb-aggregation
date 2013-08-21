var connect = require('connect');
var mongodb = require('mongodb');
var url     = require('url');

var CONNECTION_URL = process.argv[2] || 'mongodb://localhost/dma_talk'

var mongoConnection, mongoConnectionQueue;

function usingMongoConnection( cb ) {
  if ( mongoConnection ) return cb(null, mongoConnection);
  if ( mongoConnectionQueue ) return mongoConnectionQueue.push(cb);
  mongoConnectionQueue = [cb];

  var dbURL = url.parse( CONNECTION_URL ),
      mongoServer = new mongodb.Server(dbURL.host, dbURL.port || mongodb.Connection.DEFAULT_PORT, {auto_reconnect:true}),
      dbConnector = new mongodb.Db(dbURL.path.substring(1), mongoServer, {safe:false});

  return dbConnector.open( withMongoConnection );
}

function withMongoConnection( err, connection ) {
  mongoConnection = connection;
  if (mongoConnectionQueue) 
    for (var i=0, cb; cb = mongoConnectionQueue[i]; i++) cb(err, connection);
  mongoConnectionQueue = null;
} 

function collection(name) {
  return function( req, res, next ) {
    return usingMongoConnection( openCollection );

    function openCollection( err, connection ) {
      if (err) return next(err);
      return connection.collection( name, withCollection );
    }

    function withCollection( err, collection ) {
      if (err) return next(err);
      req.collection = collection;
      next();
    }
  }
}

function parseDates(obj) {
  if (typeof(obj) == 'object') {
    if (Array.isArray(obj)) return obj.map(parseDates);
    var o = {};
    for (var k in obj) if (obj.hasOwnProperty(k)) o[k] = parseDates(obj[k]);
    return o;
  }
  if (typeof(obj) == 'string' && obj.match(/^\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z$/)) return new Date(obj);
  return obj;
}

function aggregate(req, res, next) {
  return req.collection.aggregate(parseDates(req.body), withResults);

  function withResults(err, agResults) {
    if (err) return next(err);
    res.end(JSON.stringify(agResults));
  }
}

var app = connect()
  .use(connect.logger('dev'))
  .use(connect.static('public'))
  .use('/aggregate', connect.json() )
  .use('/aggregate', collection('customers'))
  .use('/aggregate', aggregate)
 .listen(8081);
console.log("Listening on port 8081")
