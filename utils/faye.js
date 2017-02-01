/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-5-7
 * Time: 上午10:36
 * To change this template use File | Settings | File Templates.
 */

var redisUtils = require('./redis')
    , faye = require('faye');
var config = require('./../global').config;


var Log = require('log')
    , log = new Log('info');


var bayeux     = new faye.NodeAdapter({mount: '/uploadApk', timeout: 20});
var PIN_CODE_CHANNEL_PREFIX=config.channel;
exports.attach = function(server){
    bayeux.attach(server);
    bayeux.bind('subscribe', function(clientId, channel) {
        log.info('[  SUBSCRIBE] ' + clientId + ' -> ' + channel);
    });

    bayeux.bind('unsubscribe', function(clientId, channel) {
        log.info('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
    });

    bayeux.bind('disconnect', function(clientId) {
        log.info('[ DISCONNECT] ' + clientId);
    });
    var authorized = function(message) {
        // returns true or false
        return true;
    };

    //only special channel can subscribe.
    bayeux.addExtension({
        incoming: function(message, callback) {
            //subscribe
            if (message.channel === '/meta/subscribe') {
                var app_key = message.ext && message.ext.app_key;
                if (app_key !== config.app_key)  {
                    message.error = '403::app key invalid';
                    log.info(message.clientId + " ->  subscribe channel: " + message.subscription +" app_key:"+app_key) ;
                }else if ( !(message.subscription !=undefined && message.subscription.indexOf(PIN_CODE_CHANNEL_PREFIX) >= 0) ) {
                    log.info(message.clientId + " ->  subscribe channel:" + message.subscription +" app_key:"+app_key) ;
//                    if (!authorized(message))
                        message.error = '404::Invalid Channel';
                }
            } else if ( message.channel.indexOf('/meta/') ==-1){  //publish data
                  var app_key = message.ext && message.ext.app_key;
                  log.info( " [PUBLISH] "+message.clientId + " -> " +message.channel +" app_key:"+app_key) ;
                  if(  message.channel.indexOf(PIN_CODE_CHANNEL_PREFIX) ==-1 ) {
                      message.error = '404::Invalid Channel';
                  }else if (app_key !== config.app_key)  {
                      message.error = '403::app key invalid';
                  }
            }
           // message.error = '404::Invalid Channel';
            callback(message);
        }
    });

}

exports.bind=function(event,callback){
    bayeux.bind(event,callback);
}

exports.subscribe=function(path,callback){
   var client = bayeux.getClient();
    client.addExtension({
        outgoing: function(message, callback) {
            message.ext = message.ext || {};
            message.ext.app_key =config.app_key;
            callback(message);
        }
    });
    client.subscribe(path,callback);
}

exports.publish=function(path,msg,callback){
    log.info("path: "+path + " msg: "+msg.toString());
    var client = bayeux.getClient();
    client.addExtension({
        outgoing: function(message, callback) {
            message.ext = message.ext || {};
            message.ext.app_key =config.app_key;
            callback(message);
        }
    });

    var publication=client.publish(path, msg);
    publication.callback(function() {
        log.info('Message received by server!');
        callback('ok');
    });

    publication.errback(function(error) {
        log.info('There was a problem: ' + error.message);
        callback('fail:' +error.message);
    });

}
