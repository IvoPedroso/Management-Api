const fetch = require('node-fetch');
const config = require('config');
const { json } = require('body-parser');

/* GET users listing. */
const listDevices = (iotAgentUrl, fiwareService, fiwareServicePath) => {
    return async () => {
        try{
            const res = 
            await fetch(iotAgentUrl + '/iot/devices',{
                method: 'get',
                headers: {  'Content-Type': 'application/json',
                            'fiware-service': fiwareService,
                            'fiware-servicepath': fiwareServicePath
                        }
            })
            return res.json();
        }
        catch( error ){
            return {error: error.message};
        } 
    };  
}

// Register device in IoT Agent.
const registerDevice = (iotAgentUrl,appID, mqttUsername, ttnV3JoinEui, appKey, apiKey, fiwareService, fiwareServicePath) => {
   
    return async (devID, dev_eui, optionalAttributes) => {
        try{
            const body  = JSON.stringify(makeProvisioningBody(mqttUsername.trim(),mqttUsername.trim() , ttnV3JoinEui.trim(), appKey.trim(), apiKey.trim(), devID.trim(), dev_eui.trim(), optionalAttributes));
            console.log(body);
            console.log(fiwareService.trim())
            console.log(fiwareServicePath.trim())
            const res =
            await fetch(iotAgentUrl + '/iot/devices',{
                method: 'post',
                body: body,
                headers: {  'Content-Type': 'application/json',
                            'fiware-service': fiwareService.trim(),
                            'fiware-servicepath': fiwareServicePath.trim()
                        }
                    })
                    console.log("iota done")
                    return {success: true, data: res.json()};
        }
        catch( error ){
            return {success: false, message: error.message};
        } 
    };  
}

const unregisterDevice = (iotAgentUrl, fiwareService, fiwareServicePath) => {
   
    return async (devID) => {
        try{
            const res = 
            await fetch(iotAgentUrl + '/iot/devices/' + devID,{
                method: 'delete',
                headers: {  'Content-Type': 'application/json',
                            'fiware-service': fiwareService,
                            'fiware-servicepath': fiwareServicePath
                        }
            })
            return {"status":res.status};
        }
        catch( error ){
            return {error: error.message};
        }  
    };  
}

// Get Device Provision Template from config file and sets device Id's. 
const makeProvisioningBody = (mqttUsername, appID, joinEui, appKey, apiKey, devID, devEui, optionalAttributes) => {

    const deviceTemplate = config.get("iotAgentLora.deviceProvisioningSettings");
    const deviceAttributes = config.get("iotAgentLora.deviceAttributes");

    let device = JSON.parse(JSON.stringify(deviceTemplate));

    device.device_id = devID;
    device.internal_attributes.lorawan.application_server.username = mqttUsername;
    device.internal_attributes.lorawan.application_server.password = apiKey;
    device.internal_attributes.lorawan.dev_eui = devEui;
    device.internal_attributes.lorawan.app_eui = joinEui;
    device.internal_attributes.lorawan.application_id = appID;
    device.internal_attributes.lorawan.application_key = appKey;

    device.attributes = [];
    deviceAttributes.mandatory.map( elem => device.attributes.push(elem));
    optionalAttributes.map( elem => device.attributes.push(elem));
    // deviceAttributes.optional.map( 
    //     elem => {
    //         if(optionalAttributes.includes(elem.name)){
    //             device.attributes.push(elem)
    //         }
    //     })  
    
    const body = {devices:[device]};
    return body
}


exports.listDevicesIoT = listDevices;
exports.registerDeviceIoT = registerDevice;
exports.unregisterDeviceIoT = unregisterDevice;