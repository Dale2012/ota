
/*
 * GET home page.
 */
var fs = require('fs')
    , http = require('http')
    , util = require('util')
    , path = require('path');

var Log = require('log')
    , log = new Log('info');

var updateConf = fs.readFileSync(path.join(__dirname+'/../conf/update.conf'))  ;
var updateNameValues = JSON.parse(updateConf.toString()) ;
log.info("updateConf: "+updateConf);

var debugConf = fs.readFileSync(path.join(__dirname+'/../conf/debug.conf'))  ;
var debugConfNameValues = JSON.parse(debugConf.toString()) ;
log.info("updateConf: "+debugConf);

var content = fs.readFileSync(path.join(__dirname+'/../conf/parameter.conf'))  ;
var paramNameValues = JSON.parse(content.toString()) ;
log.info("parameter: "+content);




exports.update = function(req, res){
    var flag= validateOTARequest(req,function(flag){
        if(flag ==true){
            log.info("parameter is ok");
            var param="firmware";
            log.info("firmware:"+req.param(param));
            var updateConfNameValues=updateNameValues;
            if(req.param('id') !=undefined && '1000' == req.param('id') )   {
                updateConfNameValues=   debugConfNameValues;
            }
            if( req.param(param) !=undefined && updateConfNameValues["lastest"] !=undefined && req.param(param) ==  updateConfNameValues["lastest"]){
                log.info("is_up_to_date: ");
                res.send("status=is_up_to_date");
            }else {
                var firmware = updateConfNameValues["lastest"];
                var url = updateConfNameValues[firmware];
                log.info("firmware:"+firmware+" url: "+url);
                res.send("url="+url);
            }
        } else {
            log.info("parameter["+flag+"] is wrong");
            res.json();
//            res.json({"res_code":"20011","res_desc":"parameter is invalid"})
        }
    });

};


function getPage(url,callback){
    var html = '';
     var req =http.get(url, function (res) {
        res.setEncoding('binary');//or hex
        res.on('data',function (data) {//加载数据,一般会执行多次
            html += data;
        }).on('end', function () {
                /*
                var buf=new Buffer(html,'binary');//这一步不可省略
                var tempCharset = getBody(html,'charset=','"');
                log.info(tempCharset);
                if(tempCharset){
                    var str=iconv.decode(buf, tempCharset);//将GBK编码的字符转换成utf8的
                } else {
                    var str=iconv.decode(buf, charset);//将GBK编码的字符转换成utf8的
                }      */
                callback(html);
            })
    }).on('error', function(err) {
            log.info("http get error:",err);
            callback(false);
        });
};

function validateOTARequest(req,callback){
    var flag=true;
    log.info("request header "+util.format(req.headers))     ;
    log.info("request url "+util.format(req.url))     ;
    log.info("request body "+util.format(req.body))     ;


    for(var param in paramNameValues)    {
        log.info("ParamName: "+param  +" :"+ paramNameValues[param] + ": req value: "+req.param(param) );
        if(flag) {
            if(  req.param(param) ==undefined || req.param(param) !=  paramNameValues[param])   {
                flag=false;
                callback(param);
            }
        }
    }
     if(flag){
       callback(true);
     }
}


