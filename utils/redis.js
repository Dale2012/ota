/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-4-28
 * Time: 下午4:15
 * To change this template use File | Settings | File Templates.
 */

var redis = require("redis");
var redisClient = redis.createClient();

var Log = require('log')
    , log = new Log('info');

redisClient.on("error", function (err) {
   log.info("Error " + err);
});

redisClient.on("connect", testRedis);

function testRedis() {
    // Set a value
    redisClient.set("string key", "Redis Successfully Connected", function (err, reply) {
        log.info(reply.toString());
    });
    // Get a value
    redisClient.get("string key", function (err, reply) {
       log.info(reply.toString());
    });
}

exports.get =function (key,callback) {
    redisClient.get(key,callback);
}

exports.set =function(key,value,callback) {
    redisClient.set(key,value,callback);
}
var REDIS_EXPIRED_TIME_KEY='_{_}_REDIS_EXPIRED_TIME_KEY';

//expired 有效期，单位为秒
exports.setExpired = function(key,expired,value,callback) {
    var time =  new Date().getTime()+1000* expired;
    redisClient.set(key+REDIS_EXPIRED_TIME_KEY, time, function (err, reply) {
       log.info("set Token suc: "+reply.toString());
    });
    redisClient.set(key,value,callback);
}

exports.getExpired = function(key,callback) {
    redisClient.get(key+REDIS_EXPIRED_TIME_KEY, function (err, reply) {
        if (err !=null || reply==null ) {
           log.info("expired invalid. err:" +err + +" reply:"+reply);
            redisClient.get(key,callback);
        } else {
            var time =  new Date().getTime();
           log.info("succ : curr time:" +time+" time expired token: "+reply.toString()+" compare time "+ (time<=reply.toString()));
             if(time<=reply.toString()) {
                 redisClient.get(key,callback);
             }  else {
                 callback('key is expired',null);
             }
        }
    });
}



exports.del=function(key,callback) {
    redisClient.del(key,callback);
}
            /*
setExpired('111',10000, '1111222', function (err, reply) {
   log.info("set Token suc: "+reply.toString());
});

getExpired("111" ,function(err,reply){
    if (err !=null || reply==null ) {
       log.info("can't find it");
    } else {
       log.info("reply:"+reply );
    }
})  ;     */