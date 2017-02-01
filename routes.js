/**
 * User: willerce
 * Date: 9/17/12
 * Time: 1:48 PM
 */

var routes = require('./routes')
    , ota = require('./routes/ota')
    , ucloudWeb = require('./routes/ucloud_web')
    , user = require('./routes/user');

module.exports = function(app){


    app.get('/update',user.auth, ota.update);
    app.post('/update',user.auth, ota.update);
    app.get('/upload',user.auth, ucloudWeb.updateForm);
    app.get('/updateHistory',user.auth, ucloudWeb.updateHistory);
    app.get('/pushMsgHistories',user.auth, ucloudWeb.pushMsgHistories);
    app.get('/preValidatePinCode',user.auth, ucloudWeb.preValidatePinCode);
    app.get('/uploadTest',user.auth, ucloudWeb.updateFormTest);
    app.post('/uploadQiNiu',user.auth, ucloudWeb.uploadQiNiu);
    app.get('/uploadQiNiu',user.auth, ucloudWeb.uploadQiNiu);
    app.post('/generatePinCode', user.auth,ucloudWeb.generatePinCode);
    app.get('/generatePinCode',user.auth, ucloudWeb.generatePinCode);

};
