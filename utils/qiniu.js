/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-4-28
 * Time: 下午4:15
 * To change this template use File | Settings | File Templates.
 */

var qiniu = require("qiniu")
    , redisUtils = require('./redis');
var Log = require('log')
    , log = new Log('info');
qiniu.conf.ACCESS_KEY = 'oSA3Q2aE1Wt771hCZI2j1GQ6iCLqT75C0ThGAsx5';
qiniu.conf.SECRET_KEY = 'AFnuA_eS8cdwdQ_RZ1Czgrs-va8OKeeV9pYjTtMZ';
var conn = new qiniu.digestauth.Client();
var bucket = "showkeytest";
// 实例化 Bucket 操作对象
var rs = new qiniu.rs.Service(conn, bucket);

/*  建立空间space
 qiniu.rs.mkbucket(conn, bucket, function(resp) {
 console.log("\n===> Make bucket result: ", resp);
 if (resp.code != 200) {
 return;
 }
 });    */

var options = {
    scope: bucket,
    expires: 100000
};

var REDIS_KEY_QI_NIU_TOKEN='REDIS_KEY_QI_NIU_TOKEN'+"_"+bucket;

exports.getToken= function (callback){
    redisUtils.getExpired(REDIS_KEY_QI_NIU_TOKEN, function (err, reply) {  reply=null;
          if (err !=null || reply==null ) {
              log.info("Token can't find it");
            var uploadPolicy = new qiniu.auth.PutPolicy(options);
            var uploadToken = uploadPolicy.token();
            var token = uploadToken.toString();
            redisUtils.setExpired(REDIS_KEY_QI_NIU_TOKEN,100000, token, function (err, reply) {
                log.info("set Token suc: "+reply.toString());
            });
            callback(token,bucket);
        } else {
            log.info("QiNiu token: "+reply);
            callback(reply,bucket);
        }

    });
}


exports.remove= function (key,callback){
    rs.remove(key, function(resp) {
        log.info("\n===> remove result: ", resp);
        if (resp.code != 200) {
            callback(key+' remove fail');
        } else {
            callback(key+' remove succ');
        }
    });
}

