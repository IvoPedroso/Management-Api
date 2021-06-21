module.exports = app => {
    const controller = {};
    const version = app.get('version');
    controller.version = (req, res) => {
        res.status(200).json({version:`Version is ${version}`});
    }
    return controller;
}