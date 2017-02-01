
/**
 * Module dependencies.
 */

var express = require('express')
  , faye = require('./utils/faye')
  , http = require('http')
  , path = require('path');

var routes = require('./routes');
var config = require('./global').config;

var app = express();



// all environments
app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());
//app.use(express.bodyParser({uploadDir:'./upload'}));
app.use(express.methodOverride());

//app.dynamicHelpers
app.use(function(req, res, next){
    next();
});

app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

faye.attach(server);



