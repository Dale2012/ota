/**
 * Created with JetBrains WebStorm.
 * User: jouplus
 * Date: 13-4-25
 * Time: 下午4:53
 * To change this template use File | Settings | File Templates.
 */
var mysql_options = {
    'host':'localhost',
    'port':3306,
    'database':'ijoyplus',
    'charset':'utf-8',
    'debug':false,
    'user':'joyplus',
    'password':'ilovetv001'
};
var sys = require('util'),
    connection = require('mysql').createConnection(
        mysql_options);

var Log = require('log')
    , log = new Log('info');

// 返回连接
exports.conn = function(){
    var tempConn=          mysql.createConnection(mysql_options);
    tempConn.query(
        'SET NAMES utf8',
        function(err, results, fields) {
            if (err) {
                throw err;
            }

          // log.info(results);
            connection.end();
        }
    );
        return tempConn;
};
// 自定义db
exports.conndb = function(db){
    if(db) mysql_options['database'] = db;
    var tempConn=          mysql.createConnection(mysql_options);
    tempConn.query(
        'SET NAMES utf8',
        function(err, results, fields) {
            if (err) {
                throw err;
            }

            //console.log(results);
            connection.end();
        }
    );
    return tempConn;
};

connection.query(
    'SET NAMES utf8',
    function(err, results, fields) {
        if (err) {
            throw err;
        }
    }
);

exports.select = function(sql,callback){
    connection.query(
        sql,
        function selectCb(error, results, fields) {
            log.info("sql: "+sql );
            if (error) {
               log.info('GetData Error: ' + error.message);
                callback(false);
            }else {
                callback(results);
            }
         });
   log.info('Connection closed');
}

exports.execute = function(sql,values,callback){
    connection.query(sql, values,
        	    function(error, results) {
                 log.info("sql: "+sql +" values:"+values);
        	      if(error) {
            	     log.info("ClientReady Error: " + error.message);
                      callback(false);
           	      }
        	     log.info('Id inserted: ' + results.insertId);
                  callback( results.insertId);
        	    }
    	  );
}




