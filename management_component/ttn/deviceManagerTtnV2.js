const ttn = require('ttn');
const config = require('config');

/* GET users listing. */
const listDevices = (appID, accessKey) => {

    return async () => {
        try{       
            const clientHandler = await ttn.application(appID.trim(), accessKey.trim(),"eu1.cloud.thethings.network:1883");
            console.log(clientHandler.appID);
            console.log(clientHandler.appAccessKey);
            console.log(clientHandler.netAddress);
            let bufferText = Buffer.from(clientHandler.appID, 'utf8'); 
            console.log(bufferText.toString('hex'));
            bufferText = Buffer.from(clientHandler.appAccessKey, 'utf8'); 
            console.log(bufferText.toString('hex'));
            const devices = await clientHandler.devices();
            return devices;
        }
        catch( error ){
            return {error: error.message};
        } 
    };    
}


    // TODO AppKey
const registerDevice = (appID, appEui, accessKey, appKey) => {

    return async (devID, devEui, devName) => {
        try{
            const clientHandler = await ttn.application(appID.trim(), accessKey.trim());
            appKey = appKey.trim();
            let devSettings = {appEui: appEui.trim(), devEui: devEui.trim(), appKey: appKey.trim()};
            if(devName){
                devSettings.devName = devName.trim();
            }
            const resgisterResponse = await clientHandler.registerDevice(devID.trim(), devSettings);
            return resgisterResponse;
        }
        catch( error ){
            
            console.log("Erro no acesso à TTN",error.message)
            return {error: error.message};
        } 
    };  
}

const unRegisterDevice = (appID, accessKey) => {

    return async (devID) => {
        try{           
            const clientHandler = await ttn.application(appID.trim(), accessKey.trim());
            const unResgisterResponse = await clientHandler.deleteDevice(devID.trim());
            return unResgisterResponse; 
        }
        catch( error ){
            return {error: error.message, errorCode: error.code};
        } 
    };  
}

exports.listDevicesTTN = listDevices;
exports.registerDeviceTTN = registerDevice;
exports.unRegisterDeviceTTN = unRegisterDevice;