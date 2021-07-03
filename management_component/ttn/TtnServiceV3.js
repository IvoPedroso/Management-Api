const { default: axios } = require('axios')

module.exports = class TtnService {

    constructor(serverHostname, applicationId, apiKey) {
        this.serverHostname = serverHostname;
        this.apiKey = apiKey;
        this.applicationId = applicationId;
        this.field_masks = {
            idServer: {
                "paths": [
                    "join_server_address",
                    "network_server_address",
                    "application_server_address",
                    "ids.dev_eui",
                    "ids.join_eui"
                ]
            },
            networkServer: {
                "paths": [
                    "supports_join",
                    "lorawan_version",
                    "ids.device_id",
                    "ids.dev_eui",
                    "ids.join_eui",
                    "lorawan_phy_version",
                    "frequency_plan_id",
                    "supports_class_b",
                    "supports_class_c"
                ]
            },
            applicationServer: {
                "paths": [
                    "ids.device_id",
                    "ids.dev_eui",
                    "ids.join_eui"
                ]
            },
            joinServer: {
                "paths": [
                    "network_server_address",
                    "application_server_address",
                    "ids.device_id",
                    "ids.dev_eui",
                    "ids.join_eui",
                    "root_keys.app_key.key"
                ]
            }
        }
    }

    async GetDevices() {
        const url = `https://${this.serverHostname}/api/v3/applications/${this.applicationId}/devices`
        try {
            
            const resp = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            })
            return { success: true, end_devices: resp.data.end_devices }
        }
        catch (error) {
            return { success: false, message: `Falha ao obter lista de dispositivos do servidor aplicacional ${this.serverHostname}` }
        }
    }

    async GetDevice(deviceId) {
        const url = `https://${this.serverHostname}/api/v3/applications/${this.applicationId}/devices/${deviceId}`
        try {
            const resp = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            })
            return { success: true, device: resp.data }
        }
        catch (error) {
            return { success: false, message: `Error listing devices from ${this.serverHostname}, Message: ${error.message}` }
        }
    }

    async DeleteDevice(deviceId) {
        const urlIdentityServer = `https://${this.serverHostname}/api/v3/applications/${this.applicationId}/devices/${deviceId}`;
        const urlJoinServer = `https://${this.serverHostname}/api/v3/js/applications/${this.applicationId}/devices/${deviceId}`;
        const urlNetworkServer = `https://${this.serverHostname}/api/v3/ns/applications/${this.applicationId}/devices/${deviceId}`;
        const urlApplicationServer = `https://${this.serverHostname}/api/v3/as/applications/${this.applicationId}/devices/${deviceId}`;
        try {
            const headers = {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            }
            let resp = await axios.delete(urlApplicationServer, headers);
            resp = await axios.delete(urlNetworkServer, headers)
            resp = await axios.delete(urlJoinServer, headers)
            resp = await axios.delete(urlIdentityServer, headers)
            return { success: true, device: resp.data }
        }
        catch (error) {
            return { success: false, message: `Error deleting device at ${this.serverHostname}, Message: ${error.message}` }
        }
    }

    async RegisterDevice(
        device_id,
        dev_eui,
        join_eui,
        app_key, // encryption key to "uncode" msg between device e application server       
        name,
        description,
        lorawan_version = "MAC_V1_0_1",
        lorawan_phy_version = "PHY_V1_0_1",
        frequency_plan_id = "EU_863_870_TTN",
        supports_class_b = false,
        supports_class_c = false,
        supports_join = true,
        network_server_address = this.serverHostname,
        application_server_address = this.serverHostname,
        join_server_address = this.serverHostname,
    ) {
        const urlIdentityServer = `https://${this.serverHostname}/api/v3/applications/${this.applicationId}/devices`;
        const urlJoinServer = `https://${this.serverHostname}/api/v3/js/applications/${this.applicationId}/devices`;
        const urlNetworkServer = `https://${this.serverHostname}/api/v3/ns/applications/${this.applicationId}/devices`;
        const urlApplicationServer = `https://${this.serverHostname}/api/v3/as/applications/${this.applicationId}/devices`;

        var data =
            this.GenerateDeviceRegisterData(
                device_id,
                join_eui,
                dev_eui,
                name,
                description,
                network_server_address,
                application_server_address,
                join_server_address,
                supports_join,
                lorawan_version,
                lorawan_phy_version,
                frequency_plan_id,
                supports_class_b,
                supports_class_c,
                app_key
            );
        console.log(data,"eee");
        console.log(this.apiKey)
        var config = {
            method: 'post',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        console.log(config.headers);
        try {
            // Request Identity Server
            config.url = urlIdentityServer;
            data.field_mask = this.field_masks.idServer;
            config.data = JSON.stringify(data);
            const respIs = await axios(config);

            // Request Join Server
            config.url = urlJoinServer;
            data.field_mask = this.field_masks.joinServer;
            config.data = JSON.stringify(data);
            const respJs = await axios(config);

            // Request Network Server
            config.url = urlNetworkServer;
            data.field_mask = this.field_masks.networkServer;
            config.data = JSON.stringify(data);
            const respNs = await axios(config);

            //Request Application Server
            config.url = urlApplicationServer;
            data.field_mask = this.field_masks.applicationServer;
            config.data = JSON.stringify(data);
            const respAs = await axios(config);

            return { success: true, device: respIs.data }
        }
        catch (error) {
            console.log(error)
            return { success: false, message: `Error registering device at ${this.serverHostname}, Message: ${error.message}` }
        }
    }

    GenerateDeviceRegisterData(
        device_id,
        join_eui,
        dev_eui,
        name,
        description,
        network_server_address,
        application_server_address,
        join_server_address,
        supports_join,
        lorawan_version,
        lorawan_phy_version,
        frequency_plan_id,
        supports_class_b,
        supports_class_c,
        app_key,
        fieldMask
    ) {
        return {
            "end_device": {
                "ids": {
                    "application_ids": {
                        "application_id": this.applicationId
                    },
                    "device_id": device_id,
                    "join_eui": join_eui,
                    "dev_eui": dev_eui
                },
                "name": name,
                "description": description,
                "network_server_address": network_server_address,
                "application_server_address": application_server_address,
                "join_server_address": join_server_address,
                "supports_join": supports_join,
                "lorawan_version": lorawan_version,
                "frequency_plan_id": frequency_plan_id,
                "lorawan_phy_version": lorawan_phy_version,
                "supports_class_b": supports_class_b,
                "supports_class_c": supports_class_c,
                "root_keys": {
                    "root_key_id": `rootkeyid${device_id}`,
                    "app_key": {
                        "key": app_key
                    }
                }
            },
            "field_mask": fieldMask
        }
    }
}