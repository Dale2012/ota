/**
 * User: Dale
 * Date: 5/21/13
 * Time: 17:01 PM
 */

exports.config = {
  port:'8030',
  channel: 'SHOW_UCLOUD_CHANNEL_'  ,
  apktool:'/home/dale/apktool/apktool.jar'  ,
  apkTempDirs:'/tmp/',
  apkMainetFile:'/AndroidManifest.xml',
  apkMainetStringFile:'/res/values/strings.xml',
  java_cmd:'/home/dale/jdk1.7/bin/java',
  app_key:'ijoyplus_android_0001bj',
  qiniu_public_access_url:'http://apk2.qiniudn.com/'
};


//运行时的临时变量
exports.runtime = {};
