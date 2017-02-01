/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-5-7
 * Time: 上午10:11
 * To change this template use File | Settings | File Templates.
 */



var faye = require('./faye')
    , path = require('path')
    , qiniu = require('./qiniu')
    , redisUtils = require('./redis')
    ,mysql = require('./mysql');

var config = require('./../global').config;

var Log = require('log')
    , log = new Log('info');

exports.updateApk=function(info,callback){
    log.info(info);
    var file_key =info['file_key'];
    var file_name =info['file_name'];
    var file_size =info['file_size'];
    var file_type =info['file_type'];
    var pinCode =info['pinCode'];
    var url =info['url'];
    var fileMD5 =info['fileMD5'];
    var package =info['package'];
    var versionCode =info['versionCode'];
    var versionName =info['versionName'];
    var minSdkVersion  =info['minSdkVersion'];
    var appName  =info['appName'];
    var targetSdkVersion =info['targetSdkVersion'];
    var dbFileUrl=false;
    mysql.select("select id, file_url,apk_id,qiniu_file_key from apk_master_items where version_code='"+versionCode+"' and version_name='"+versionName+"' and package_name='"+package+"'" +
        " and md5='"+fileMD5+"'",function(result){
        log.info("result apk_master_items length : "+result.length );
        if(result.length > 0)  {
            var firstResult = result[0];
            dbFileUrl=firstResult['file_url'];
            var fileKey= firstResult['qiniu_file_key'];
            var apkID=  firstResult['apk_id'];
            log.info("apk_id:" +apkID);

            if(file_key != fileKey){
                qiniu.remove(file_key,function(msg){
                    log.info("Remove key["+file_key+"]: "+msg)   ;
                }) ;
            }

            mysql.select("select apk_icon from apk_master_base where id='"+apkID+"'",function(result){
                if(result.length > 0)  {
                    var firstResult = result[0];
                    var icon =firstResult['apk_icon'];
                    log.info('icon '+icon);
                    this.sendMsg(dbFileUrl,pinCode,fileKey,appName,icon,fileMD5,versionCode,versionName,package,function(msg){
                        log.info("updateApk sendMsg: "+msg);
                        callback(msg);
                    })  ;

                } else {
                    this.sendMsg(dbFileUrl,pinCode,fileKey,appName,'',fileMD5,versionCode,versionName,package,function(msg){
                        log.info("updateApk sendMsg: "+msg);
                        callback(msg);
                    })  ;
                }
            }) ;

            //increase
            mysql.execute("update apk_master_items set upload_count=upload_count+1 where id=?",[firstResult['id']],function(msg){
                  // log.info();
            })  ;
            mysql.execute("update apk_master_base set upload_count=upload_count+1 where id=?",[apkID],function(msg){

            })  ;

        }else {
            mysql.select("select id,file_url,qiniu_file_key from apk_master_temp where version_code='"+versionCode+"' and version_name='"+versionName+"' and package_name='"+package+"'" +
                " and md5='"+fileMD5+"'",function(result){
                log.info("result length: "+result.length );
                if(result.length > 0)  {
                    var firstResult = result[0];
                    dbFileUrl=firstResult['file_url'];
                    var fileKey= firstResult['qiniu_file_key'];
                    this.sendMsg(dbFileUrl,pinCode,fileKey,appName,'',fileMD5,versionCode,versionName,package,function(msg){
                        log.info("updateApk sendMsg: "+msg);
                        callback(msg);
                    })  ;

                    if(file_key != fileKey){
                        qiniu.remove(file_key,function(msg){
                            log.info("Remove key["+file_key+"]: "+msg)   ;
                        }) ;
                    }

                    mysql.execute("update apk_master_temp set upload_count=upload_count+1 where id=?",[firstResult['id']],function(msg){
                        // log.info();
                    })  ;
                } else {
                    this.sendMsg(url,pinCode,file_key,appName,'',fileMD5,versionCode,versionName,package,function(msg){
                        log.info("updateApk sendMsg: "+msg);
                        callback(msg);
                    })  ;
                    mysql.execute("insert into apk_master_temp(package_name,upload_count,file_url,file_type,qiniu_file_key,file_size,md5," +
                        "version_code,version_name,min_sdk_version,target_sdk_version,file_name,create_date,app_name)" +
                        " values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[package,'1',url,file_type,file_key,file_size,fileMD5,versionCode,versionName,minSdkVersion,targetSdkVersion,file_name,new Date(),appName],
                        function(id){
                        log.info(id)       ;
                    });
                }
            });

        }
    });

}

sendMsg=function(fileUrl,pincode,file_key,appName,icon,fileMD5,versionCode,versionName,package,callback){
    log.info("[url]:"+fileUrl + " [pin code]:"+pincode +" [file key] :"+file_key);
    //get mac address for pin code.
    mysql.select("select device_mac_address from apk_device where pin_code='"+pincode+"'",function(result){
        log.info("result length: "+result.length );
        if(result.length > 0)  {
            var firstResult = result[0];
            var mac=  firstResult['device_mac_address'];
            log.info("[mac address]" +mac);
            //add new record for push msg history
            mysql.select("select id from apk_push_msg_history where version_code='"+versionCode+"' and version_name='"+versionName+"' and package_name='"+package+"'" +
                " and md5='"+fileMD5+"' and status=1 and mac_address='"+mac+"'",function(result){
                log.info("result  length : "+result.length );
                if(result.length == 0)  {
                    mysql.execute("insert into apk_push_msg_history(package_name,file_url,qiniu_file_key," +
                        "version_code,version_name,md5,create_date,app_name,mac_address)" +
                        " values(?,?,?,?,?,?,?,?,?)",[package,fileUrl,file_key,versionCode,versionName,fileMD5,new Date(),appName,mac],
                        function(id){
                            log.info("apk_push_msg_history id: "+id)       ;
                            redisUtils.get(pincode, function (err, reply) {
                                log.info("err:" +err +" reply:"+reply);
                                if (!err) {
                                    if (reply != null) {
                                        log.info("channel " +reply);
                                        //push msg to device
                                        faye.publish("/"+reply,{'msg_type':'1','body':{id:id,file_url:fileUrl,file_key:file_key,app_name:appName,icon:icon}},function(msg){
                                            log.info(msg);
                                            callback('ok')  ;
                                        });
                                    }else {
                                        callback('fail')  ;
                                    }
                                }else {
                                    callback('fail')  ;
                                }

                            });
                        });
                } else {
                    var firstResult = result[0];
                    var ids=  firstResult['id'];
                    log.info("apk_push_msg_history id: " + ids)       ;
                    redisUtils.get(pincode, function (err, reply) {
                        log.info("err:" +err +" reply:"+reply);
                        if (!err) {
                            if (reply != null) {
                                log.info("channel " +reply);
                                //push msg to device
                                faye.publish("/"+reply,{'msg_type':'1','body':{id:ids,file_url:fileUrl,file_key:file_key,app_name:appName,icon:icon}},function(msg){
                                    log.info(msg);
                                    callback('ok')  ;
                                });
                            }else {
                                callback('fail')  ;
                            }
                        }else {
                            callback('fail')  ;
                        }

                    });
                }
            } );
        }
    })  ;




}




exports.preValidatePinCode= function(pin_code, callback){
    mysql.select("select device_name, device_mac_address, channel_name from apk_device where pin_code='"+pin_code+"'",function(result){
        log.info("result length: "+result.length );
        if(result.length > 0)  {
            var firstResult = result[0];
            var device_name=  firstResult['device_name'];
            var device_mac_address=  firstResult['device_mac_address'];
            var channel_name=  firstResult['channel_name'];
            log.info(" device_name: "+device_name +" device_mac_address: "+device_mac_address +" channel_name: "+channel_name);
            //delete old pin code in redis
            callback({'device':device_name,'channel':channel_name,'mac':device_mac_address});
        } else {
             callback(false);
        }
    })  ;
}

exports.updateHistory= function(mac_address,id, callback){
    mysql.execute("update apk_push_msg_history set status=2 where id=? and mac_address=?",[id,mac_address],function(msg){
        log.info(msg) ;
       callback(msg);
    })  ;
}

exports.pushMsgHistories =function(mac_address,offset,page_size,callback){
    mysql.select("SELECT history.id, history.file_url, history.qiniu_file_key, history.create_date, history.app_name ," +
        " apk.apk_icon FROM apk_push_msg_history AS history  LEFT JOIN apk_master_base AS apk ON history.package_name = apk.package_name" +
        " where history.status =1 and history.mac_address='"+mac_address+"' limit "+offset +" , "+page_size,function(result){
        log.info("result length: "+result.length );
        var length=     result.length  ;
        if(length> 0)  {
            var arrayObj = new Array();
            for(var i=0;i<length;i++){
                var firstResult = result[i];
                var itemArrayObj ={
                    'id':    firstResult['id'],
                    'file_url':    firstResult['file_url'],
                    'file_key':    firstResult['qiniu_file_key'],
                    'create_date':    firstResult['create_date'],
                    'app_name':    firstResult['app_name'] ,
                    'icon':    firstResult['apk_icon']
                } ;
                arrayObj.push(itemArrayObj);
            }
            callback(arrayObj)        ;
        }else {
            callback([]);
        }
    });
}


exports.generatePinCode=function(mac_address,client,callback){
    //delete mac_address related record
    mysql.select("select pin_code from apk_device where device_mac_address='"+mac_address+"'",function(result){
        log.info("result length: "+result.length );
        if(result.length > 0)  {
            var firstResult = result[0];
            var oldPinCode=  firstResult['pin_code'];
            log.info("old pin code: "+oldPinCode);
            //delete old pin code in redis
            redisUtils.del(oldPinCode, function (err, reply) {
                log.info(reply.toString());
            });
        }
        mysql.execute("delete from apk_device where device_mac_address=?",[mac_address],function(msg){
            genPinCode(client,mac_address,function(pinCode){
                //set pin code
                redisUtils.set(pinCode, PIN_CODE_CHANNEL_PREFIX+pinCode, function (err, reply) {
                    log.info(reply.toString());
                });
                callback(pinCode,PIN_CODE_CHANNEL_PREFIX+pinCode);
            });

        })  ;
    });
}
var PIN_CODE_CHANNEL_PREFIX=config.channel;

function genPinCode(client,mac_address,callback){
    var pinCode= randomCode(6);
    log.info(pinCode);
    mysql.select("select id from apk_device where pin_code='"+pinCode+"'",function(result){
        log.info("result length: "+result.length );
        if(result.length > 0)  {
            genPinCode(client,mac_address,callback);
        }else {
            mysql.execute("insert into apk_device(device_name,device_mac_address,pin_code,channel_name)" +
                " values(?,?,?,?)",[client,mac_address,pinCode,PIN_CODE_CHANNEL_PREFIX+pinCode],
                function(id){
                    log.info(id) ;
                    callback( pinCode);
                });

        }
        }
     );
}

function randomCode(length){
    var cap='abcdefghijklmnopqrstuvwxyzzyxwvutsrqponmlkjihgfedcba';
    var num='01234567899876543210';
    var code='';
    for(var i=0;i<length;i++){
        var randomInt= randomNumber(length*37+1);
        var tempCode='';
        var tempLength=0;
        if(randomInt%2 ==0) {
            tempCode =cap;
            tempLength=52;
        }  else {
            tempCode =num;
            tempLength=20;
        }

        var random= randomNumber(tempLength);
        if(random ==0 ) {
            code+=tempCode.substr(0,1);
        }else if(random ==tempLength ) {
            code+=tempCode.substr((tempLength-1),1);
        } else {
            code+=tempCode.substr(random,1);
        }

    }
    return code;
}

function randomNumber(input){
    var numInput = new Number(input);
    var numOutput = new Number(Math.random() * numInput).toFixed(0);
    return numOutput;
}

