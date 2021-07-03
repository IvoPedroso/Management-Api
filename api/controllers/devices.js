const dockerSecret = require('../../docker_helper/dockersecrets');
const config = require('config');
const TtnServiceV3 = require('../../management_component/ttn/TtnServiceV3');
const {listDevicesIoT, registerDeviceIoT, unregisterDeviceIoT} = require("../../management_component/iot_agent_lora/deviceManagerIota");
const short = require('short-uuid');

module.exports = app => {
    const controller = {};

    // TTN V3 Init parameters
    let ttnV3Hostname;
    let ttnV3appId;
    let ttnV3MqttUsername
    let ttnV3JoinEui;
    let ttnV3apiKey;
    let ttnV3appKey;
    
    let iotAgentHost;
    let iotAgentPort;

    let iotService;
    let iotServicePath;

    console.log(process.env.NODE_ENV);
    if(process.env.NODE_ENV == 'development'){

        ttnV3Hostname = config.get("ttnV3.ServerHostname");
        ttnV3appId = config.get("ttnV3.ApplicationId");
        ttnV3MqttUsername = config.get("ttnV3.MqttUsername");
        ttnV3JoinEui = config.get("ttnV3.JoinEui");
        ttnV3apiKey = config.get("ttnV3.ApiKey");
        ttnV3appKey = config.get("ttnV3.AppKey");
        
        iotAgentHost = config.get("IOT_AGENT_IP");
        iotAgentPort = config.get("IOT_AGENT_PORT");
        iotService = config.get("iotService");
        iotServicePath = config.get("iotServicePath");
    }
    else{
        // TTN V3 Hostname
        ttnV3Hostname = (process.env.TTNV3_HOSTNAME || config.get("ttnV3.ServerHostname"));
        if(!ttnV3Hostname){
            exit_with_missing_env_error("TTNV3_HOSTNAME");
        }

        // TTN V3 AppID
        ttnV3appId = (process.env.TTNV3_APPID || config.get("ttnV3.ApplicationId"));
        if(!ttnV3appId){
            exit_with_missing_env_error("TTNV3_APPID");
        }

        // TTN V3 MQTT User 
        ttnV3MqttUsername = (process.env.TTNV3_MQTT_USERNAME || config.get("ttnV3.MqttUsername"));
        if(!ttnV3MqttUsername){
            exit_with_missing_env_error("TTNV3_MQTT_USERNAME");
        } 

        // TTN V3 JoinEUI
        ttnV3JoinEui = (process.env.TTNV3_JOIN_EUI || config.get("ttnV3.JoinEui"));
        if(!ttnV3JoinEui){
            exit_with_missing_env_error("TTNV3_JOIN_EUI");
        }

        // Aplication key use to generate session keys in LoRaWAN
        ttnV3apiKey = (dockerSecret.read("ttn_api_key") || config.get("ttnV3.ApiKey"));
        if(!ttnV3apiKey){
            exit_with_missing_docker_secret_error("ttn_api_key");
        }
        else{
            ttnV3apiKey = ttnV3apiKey.trim();
        }

        ttnV3appKey = (dockerSecret.read("ttn_app_key") || config.get("ttnV3.AppKey"));
        if(!ttnV3apiKey){
            exit_with_missing_docker_secret_error("ttn_app_key");
        } 
        else{
            ttnV3appKey = ttnV3appKey.trim();
        }

        iotAgentHost = (process.env.IOT_AGENT_IP || config.get("IOT_AGENT_IP"));
        if(!iotAgentHost){
            exit_with_missing_env_error("IOT_AGENT_IP");
        } 

        iotAgentPort = (process.env.IOT_AGENT_PORT || config.get("IOT_AGENT_PORT"));
        if(!iotAgentPort){
            exit_with_missing_env_error("IOT_AGENT_PORT");
        } 

        iotService = (process.env.FIWARE_SERVICE || config.get("iotAgentLora.fiware-service"));
        if(!iotService){
            exit_with_missing_env_error("FIWARE_SERVICE");
        } 

        iotServicePath = (process.env.FIWARE_SERVICE_PATH || config.get("iotAgentLora.fiware-servicepath"));
        if(!iotServicePath){
            exit_with_missing_env_error("FIWARE_SERVICE_PATH");
        } 
    }

    // TTN Setup
    const ttnService = new TtnServiceV3(ttnV3Hostname, ttnV3appId, ttnV3apiKey)

    // IoT Agent Setup
    const iotAgentUrl = `http://${iotAgentHost}:${iotAgentPort}`

    const listDevIoT = listDevicesIoT(iotAgentUrl, iotService, iotServicePath);
    const registerDevIoT = registerDeviceIoT(iotAgentUrl,ttnV3appId, ttnV3MqttUsername, ttnV3JoinEui, ttnV3appKey, ttnV3apiKey, iotService, iotServicePath);

    const unResgisterDevIoT = unregisterDeviceIoT(iotAgentUrl, iotService, iotServicePath);


    // List Devices.
    controller.listDevices = async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        //const devicesTTN = await listDevsTTN();
        const devicesTTN = await ttnService.GetDevices();
        const devicesIotAgent = await listDevIoT();
        if(devicesTTN.error || devicesIotAgent.error){
            const ttnError = (devicesTTN && devicesTTN.error) ? devicesTTN.error : {};
            const iotAgentError = (devicesIotAgent && devicesIotAgent.error) ? devicesIotAgent.error : {};
    
            return res.status(500).json({"errors": { "IotAgentError":iotAgentError, "TtnError":ttnError }});
        }
        res.status(200).json({"devicesTTN": devicesTTN, "devicesIotAgent": devicesIotAgent.devices});
    }

    // Register Device in TTN and IotAgent.
    controller.registerDevice = async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        let devEuiGenerated = false;
        let devEui;
        let devName;
        let optionalAttributes;
        if(!req.body.devID){
            return res.status(400).json({"error": "Missing devID."});
        }
        if(req.body.devName){
            devName = req.body.devName;
        }        
        if(req.body.devEui){
            devEui = req.body.devEui;
        }
        else{
            devEui = generateEui();
            devEuiGenerated = true;
        }
        if(req.body.optionalAttributes){
            optionalAttributes = req.body.optionalAttributes;
        }
        const registerTTNResponse = await ttnService.RegisterDevice(req.body.devID, devEui, ttnV3JoinEui ,ttnV3appKey,devName);
        
        
        let registerIotAgentResponse = null;
        if(registerTTNResponse.success){
            console.log("TTN Register")
            registerIotAgentResponse = await registerDevIoT(req.body.devID,devEui, optionalAttributes);         
            if(registerIotAgentResponse.success){
                console.log("Iot Register")
                let response = {success:true, message: "Device Registered."};
                if(devEuiGenerated){
                    response.generateEui = devEui;
                }
                return res.status(200).json(response);
            }
            else{
                ttnService.DeleteDevice(req.body.devID);
                return res.status(500).json({success:false,"errors": { "IotAgentError":registerIotAgentResponse.message}});
            }
        }
        return res.status(500).json({success:false, "errors": { "TtnError":registerTTNResponse.message}});
        const ttnError = (registerTTNResponse && registerTTNResponse.error) ? registerTTNResponse.error : {};
        const iotAgentError = (registerIotAgentResponse && registerIotAgentResponse.error) ? registerIotAgentResponse.error : {};

        return res.status(500).json({"errors": { "IotAgentError":iotAgentError, "TtnError":ttnError }});
    }

    controller.unregisterDevice = async (req, res) =>{
        if(!req.body.devID){
            return res.status(400).json({"error": "Missing devID."});
        }
        res.setHeader('Access-Control-Allow-Origin', '*'); 
        const unRegisterDeviceTtnResponse = await unRegisterDevTTN(req.body.devID);
        let unregisterDeviceIoTResponse = null;
        if(!unRegisterDeviceTtnResponse.error || unRegisterDeviceTtnResponse.errorCode === 5){ //If no error or not found.
             unregisterDeviceIoTResponse = await unResgisterDevIoT(req.body.devID);
            if(!unregisterDeviceIoTResponse.error){
                if(( unRegisterDeviceTtnResponse.errorCode == 5) && (unregisterDeviceIoTResponse.status == 404) ){
                    return res.status(400).json({"message":"Device Not Found."});
                }
                else{
                    return res.status(200).json(
                        {"unRegisterDeviceTtnResponse": unRegisterDeviceTtnResponse.errorCode == 5 ? "Device Not Found in TTN": "Device remove from TTN",
                        "unregisterDeviceIoTResponse": unregisterDeviceIoTResponse.status == 404 ? "Device Not Found in IoT Agent": "Device remove from IoT Agent"
                    });
                }
                
            }
            else{
                // Todo Rollback.
            }
        }
        const ttnError = (unRegisterDeviceTtnResponse && unRegisterDeviceTtnResponse.error) ? unRegisterDeviceTtnResponse.error : {};
        const iotAgentError = (unregisterDeviceIoTResponse && unregisterDeviceIoTResponse.error) ? unregisterDeviceIoTResponse.error : {};

        return res.status(500).json({"errors": { "IotAgentError":iotAgentError, "TtnError":ttnError }});
        
    }

    const generateEui = () =>{
        const uuid = short.uuid();
        const uuidParts = uuid.split('-');
        const eui = uuidParts[3].concat(uuidParts[4]);
        return eui;
    }

    return controller
}

const exit_with_missing_env_error = (env_missing) => {
    console.error(`${env_missing} Enviroment variable undefined.`)
    process.exit(1);
}

const exit_with_missing_docker_secret_error = (docker_secret_missing) => {
    console.error(`${docker_secret_missing} Docker Secret undefined.`)
    process.exit(1);
}