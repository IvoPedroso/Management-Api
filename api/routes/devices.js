const cors = require('cors');

module.exports = app =>{
    const controllerDev = app.controllers.devices;
    const controllerVersion = app.controllers.version;
    const controllerChart = app.controllers.chart;

    app.use(cors());

    app.route('/api/devices')
        .get(controllerDev.listDevices);
    app.route('/api/registerdevice')
        .post(controllerDev.registerDevice);
    app.route('/api/unregisterdevice')
        .post(controllerDev.unregisterDevice);
    app.route('/api/version')
        .get(controllerVersion.version);
    app.route('/api/colorchart')
        .get(controllerChart.GetColorChart);
    app.route('/api/updatemetric')
        .post(controllerChart.UpdateMetric);
    app.route('/api/addmetric')
        .post(controllerChart.AddMetric);
    app.route('/api/getallmetrics')
        .get(controllerChart.GetAllMetrics);
    app.route('/api/getmetric')
        .get(controllerChart.GetMetric);
}