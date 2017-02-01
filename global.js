/**
 * User: willerce
 * Date: 9/17/12
 * Time: 1:01 PM
 */

exports.config = {
  port:'8000',
  channel: 'SHOW_UCLOUD_CHANNEL_'  ,
  apktool:'H:\\dex2jar-0.0.9.12-a\\apktool-install-windows-r05-ibot\\apktool.jar'  ,
  apkTempDirs:'H:\\dex2jar-0.0.9.12-a\\',
  apkMainetFile:'\\AndroidManifest.xml',
  apkMainetStringFile:'\\res\\values\\strings.xml',
  java_cmd:'java',
  app_key:'ijoyplus_android_0001bj',
  qiniu_public_access_url:'http://apk2.qiniudn.com/'
};


//运行时的临时变量
exports.runtime = {};
