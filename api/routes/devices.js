module.exports = app =>{
    const controllerDev = app.controllers.devices;
    const controllerVersion = app.controllers.version;

    app.route('/api/devices')
        .get(controllerDev.listDevices);
    app.route('/api/registerdevice')
        .post(controllerDev.registerDevice);
    app.route('/api/unregisterdevice')
        .post(controllerDev.unregisterDevice);
    app.route('/api/version')
        .get(controllerVersion.version);
}