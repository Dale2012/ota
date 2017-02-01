function checkmobile(useragent) {
    var mobilebrowser_list =new Array('iphone', 'android', 'phone', 'mobile', 'wap', 'netfront', 'java', 'opera mobi', 'opera mini',
        'ucweb', 'windows ce', 'symbian', 'series', 'webos', 'sony', 'blackberry', 'dopod', 'nokia', 'samsung',
        'palmsource', 'xda', 'pieplus', 'meizu', 'midp', 'cldc', 'motorola', 'foma', 'docomo', 'up.browser',
        'up.link', 'blazer', 'helio', 'hosin', 'huawei', 'novarra', 'coolpad', 'webos', 'techfaith', 'palmsource',
        'alcatel', 'amoi', 'ktouch', 'nexian', 'ericsson', 'philips', 'sagem', 'wellcom', 'bunjalloo', 'maui', 'smartphone',
        'iemobile', 'spice', 'bird', 'zte-', 'longcos', 'pantech', 'gionee', 'portalmmm', 'jig browser', 'hiptop',
        'benq', 'haier', '^lct', '320x320', '240x320', '176x220');
    var pad_list = new Array('pad', 'gt-p1000');

    if(dstrpos(useragent, pad_list)) {
        return false;
    }
    if(dstrpos(useragent, mobilebrowser_list)) {
        return true;
    }
    var browerlist = new Array('mozilla', 'chrome', 'safari', 'opera', 'm3gate', 'winwap', 'openwave', 'myop');
    if(dstrpos(useragent, browerlis)){
        return false;
    }

     return false;
}

function dstrpos(useragent,list) {
    if(useragent==null || useragent==''){
        return false;
    }
    useragent=useragent.toLowerCase();
    for(var i=0;i<list.length;i++){
         var value = list[i];
        if(useragent.indexOf(value)>-1){
            return true;
        }
    }
    return false;
}

  var isMobile=checkmobile('mozilla/5.0 (iphone; u; cpu iphone os 4_3_3 like mac os x; en-us) applewebkit/533.17.9 (khtml, like gecko) version/5.0.2 mobile/8j2 safari/6533.18.5') ;
console.info(isMobile);