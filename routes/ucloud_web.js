
/*
 * GET home page.
 */
var fs = require('fs')
    , path = require('path')
    , util = require('util')
    ,sys = require('sys')
    ,crypto = require('crypto')
    ,http = require('http')
    , faye = require('./../utils/faye')
    , qiniu = require('./../utils/qiniu')
    , ucloud = require('./../utils/ucloud')
    ,exec = require('child_process').exec;
var config = require('./../global').config;
var Log = require('log')
    , log = new Log('info');


exports.upload = function(req, res){
    log.info(req.body);

    log.info(req.files);

    // 获得文件的临时路径
    var tmp_path = req.files.thumbnail.path;
    // 指定文件上传后的目录 - 示例为"images"目录。
    var target_path = './upload/' + req.files.thumbnail.name;
    var readStream = fs.createReadStream(tmp_path)
    var writeStream = fs.createWriteStream(target_path);
    // 移动文件
    util.pump(readStream, writeStream, function() {
        parseApkFile(target_path,function(package,versionCode,versionName){
            if(package !=false){
                log.info("package:"+package);
            }
        });
        fs.unlinkSync(tmp_path);
        res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
    });
};

exports.updateForm = function(req, res){
    qiniu.getToken(function(token,bucket){
        res.render('uploadForm', { token : token , bucket:bucket});
    })  ;

};

exports.updateFormTest = function(req, res){
    qiniu.getToken(function(token,bucket){
        res.json( { token : token , bucket:bucket,app_key:config.app_key});
    })  ;
};

exports.preValidatePinCode = function(req, res){
    var pin_code =  req.param('pin_code');
    log.info("pin code: "+pin_code);
    ucloud.preValidatePinCode(pin_code,function(result){
        log.info("result : "+result  );
        res.json(result);
    })  ;
};

exports.pushMsgHistories =function(req,res){
    var mac_address =  req.param('mac_address');
    var app_key = req.get('app_key');
    var page_num = req.param('page_num');
    var page_size = req.param('page_size');
    app_key='ijoyplus_android_0001bj';
    log.info( " mac_address: "+mac_address +" app_key: "+app_key +" page_num: "+page_num +" page_size: "+page_size);
    if (app_key_const == app_key) {
        if(mac_address != undefined && mac_address!='' ){
            if(page_num == undefined  || !isInt(page_num) ){
                page_num=1;
            }
            if(page_size == undefined  || !isInt(page_size) ){
                page_size=10;
            }
            ucloud.pushMsgHistories(mac_address,page_size*(page_num-1),page_size,function(result){
                log.info("result : "+result  );
                res.json(result);
            })  ;
        } else {
            res.json({"res_code":"20011","res_desc":"Param is invalid"}) ;
        }
    }else {
        res.json({"res_code":"10006","res_desc":"Source paramter (appkey) is missing or invalid"});
    }
};

exports.updateHistory =function(req,res){
    var mac_address =  req.param('mac_address');
    var app_key = req.get('app_key');
    var id  = req.param('id');
    app_key='ijoyplus_android_0001bj';
    log.info( " mac_address: "+mac_address +" app_key: "+app_key +" id: "+id);
    if (app_key_const == app_key) {
        if(mac_address != undefined && mac_address!='' && id != undefined && id!=''){
            ucloud.updateHistory(mac_address,id,function(result){
                log.info("result : "+result  );
                res.json({'res_code':'00000','res_desc':'succ'});
            })  ;
        } else {
            res.json({"res_code":"20011","res_desc":"Param is invalid"}) ;
        }
    }else {
        res.json({"res_code":"10006","res_desc":"Source paramter (appkey) is missing or invalid"});
    }
};

var app_key_const=config.app_key;

function isInt(str){
    var r = /^\+?[1-9][0-9]*$/;
   return r.test(str);
}
exports.generatePinCode = function(req, res){
    var client =  req.param('client');
    var mac_address =  req.param('mac_address');
    var app_key = req.get('app_key');
    app_key='ijoyplus_android_0001bj';
    log.info("client: "+client + " mac_address: "+mac_address +" app_key: "+app_key);
    if (app_key_const == app_key) {
        if(mac_address != undefined && mac_address!='' ){
           ucloud.generatePinCode(mac_address,client,function(pinCode,channel){
                log.info("pin Code : "+pinCode +"channel "+channel  );
                res.json({"pinCode":pinCode,"channel":channel});
           })  ;
        } else {
            res.json({"res_code":"20011","res_desc":"Param is invalid"}) ;
        }
    }else {
        res.json({"res_code":"10006","res_desc":"Source paramter (appkey) is missing or invalid"});
    }
};

exports.uploadQiNiu = function(req, resp){
    var file_key =  req.param('file_key');
    var file_name =  req.param('file_name');
    var file_size =  req.param('file_size');
    var file_type =  req.param('file_type');
    var pinCode =  req.param('pinCode');
    var url =       QINIU_PUBLIC_ACCESS_URL+file_key;
    var target_path = './upload/' +file_key;
    var writeStream = fs.createWriteStream(target_path,wOption);
    var fileMD5='';
    try{
        var req = http.get(url, function(res){
                res.on('data', function(data){
                    //log.info(data);
                    writeStream.write(data);
                    }).on('end', function(){
                        writeStream.end();
                        parseApkFile(target_path,function(package,versionCode,versionName,minSdkVersion,targetSdkVersion,appName){
                           if(package !=false){
                                  log.info("package:"+package);
                               fs.readFile(target_path,function(err,data){
                                   if(err) throw err;
                                   var md5 = crypto.createHash('md5');
                                   md5.update(data);
                                   fileMD5 = md5.digest('hex');
                                   log.info('fileMD5 ====='+fileMD5);
                                   ucloud.updateApk({
                                       file_key:file_key,
                                       file_name:file_name,
                                       file_size:file_size,
                                       file_type:file_type,
                                       pinCode:pinCode,
                                       url:url,
                                       fileMD5 :fileMD5,
                                       package:package,
                                       versionCode:versionCode,
                                       versionName:versionName,
                                       minSdkVersion :minSdkVersion,
                                       targetSdkVersion:targetSdkVersion ,
                                       appName:appName
                                   },function(msg){
                                        log.info(msg);
                                       resp.json({msg:msg});
                                   })    ;
                                   fs.unlinkSync(target_path);
                               });
                           }else {
                               resp.json({msg:'invalid'});
                           }
                        });
//
                        }).on('close', function(){
                            log.info('Close received!');
                        });
        	    });
    	    req.on('error', function(error){
                resp.json({msg:'failer'});
        	        fs.appendFile('error.log', new Date().getTime()+' '+error+'\r\n', 'utf-8');
        	    });

    }catch(error){
        console.err(error) ;
    }
    log.info(url);

};
var wOption = {
    flags: "a",
    encoding: null,
    mode: 0666
}

var  QINIU_PUBLIC_ACCESS_URL=config.qiniu_public_access_url;

var apktool=config.apktool;

var apkTempDirs=config.apkTempDirs;



function parseApkFile(apkFile,callback){
    // executes `pwd`
    var apkTempDir =apkTempDirs+new Date().getTime();
    var apkMainetFile=  apkTempDir+config.apkMainetFile;
    var apkMainetStringFile=  apkTempDir+config.apkMainetStringFile;
    var pwd=config.java_cmd+" -jar "+apktool+" d -f "+apkFile+" "+apkTempDir;
    log.info(pwd);
    exec(pwd, function (error, stdout, stderr) {
        if ( !fs.existsSync(apkMainetFile)) {
            log.info('exec error: ' + stderr);
            callback(false,false,false,false,false)    ;
        }  else {
            var mainetFileContentStr =fs.readFileSync(apkMainetFile).toString();

            var versionName = getBody(mainetFileContentStr,"android:versionName=\"","\"");
            log.info("versionName: "+versionName);

            var versionCode = getBody(mainetFileContentStr,"versionCode=\"","\"");
            log.info("versionCode: "+versionCode);

            var package = getBody(mainetFileContentStr,"package=\"","\"");
            log.info("package: "+package);
            var minSdkVersion = getBody(mainetFileContentStr,"android:minSdkVersion=\"","\"");
            log.info("minSdkVersion: "+minSdkVersion);
            var targetSdkVersion = getBody(mainetFileContentStr,"android:targetSdkVersion=\"","\"");
            log.info("targetSdkVersion: "+targetSdkVersion);
            var appName="";
            if (fs.existsSync(apkMainetStringFile)) {
                 mainetFileContentStr =fs.readFileSync(apkMainetStringFile).toString();
                 appName=getBody(mainetFileContentStr,"app_name\">","<");
                log.info("appName: "+appName);
            }

            callback(package,versionCode,versionName,minSdkVersion,targetSdkVersion,appName)    ;
            rmdirSync(apkTempDir,function(e){
                log.info("!!!"+e)
                log.info("删除【"+apkTempDir+"】目录以及子目录成功")
            }) ;
        }
    });
} ;

function getBody(body,startStr,endStr){
    if(body == undefined || body ==''){
        return false;
    }
    if(startStr == undefined || startStr ==''){
        return false;
    }
    if(endStr == undefined || endStr ==''){
        return false;
    }
    if(body.indexOf(startStr) !=-1) {
//         log.info(body.indexOf(startStr));
        var str = body.substr(body.indexOf(startStr) + startStr.length)   ;
//         log.info(str.indexOf(endStr));
        str = str.substring(0,str.indexOf(endStr));
        return str;
    }
    return false;
}


//删除目录
var rmdirSync = (function(){
    function iterator(url,dirs){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path,dirs){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,dirs);
        }
    }
    return function(dir,cb){
        cb = cb || function(){};
        var dirs = [];

        try{
            iterator(dir,dirs);
            for(var i = 0, el ; el = dirs[i++];){
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();

//var readStream = fs.createReadStream('d:\\S1Home.apk') ;
//
//readStream.readAsArrayBuffer()
