const mongoose = require('mongoose');

module.exports = app => {
    mongoose.Promise = global.Promise;
    
    const controller = {};

    controller.GetColorChart = async (req, res) => {
        const metric = req.body.metric;
        mongoose.connect("mongodb://localhost:27017/chartColor",{ useNewUrlParser: true, useUnifiedTopology: true }); // TODO Get url from appSettings
        const ColorChartModel = mongoose.model('ColorChart', colorChartSchema);
        const docs = await ColorChartModel.findOne({'metric': metric}).exec();
        if(docs){
            res.status(200).json({metricRanges: docs._doc});
        }
        else{
            res.status(404).json({message:'Métrica não existe.'});
        }       
    }

    controller.GetAllMetrics = async(req, res) =>{
        mongoose.connect("mongodb://localhost:27017/chartColor",{ useNewUrlParser: true, useUnifiedTopology: true }); // TODO Get url from appSettings
        const ColorChartModel = mongoose.model('ColorChart', colorChartSchema);
        let metrics = [];
        const docs = await ColorChartModel.find({}).exec();
        res.status(200).json({metrics: docs});
    }

    controller.UpdateMetric = async (req, res) => {

        req.body.metricData.metricName
        mongoose.connect('mongodb://localhost:27017/metric', { useNewUrlParser: true, useUnifiedTopology: true }); // TODO Get url from appSettings
        const metricModel = mongoose.model('Metric', metricSchema);
        try{
            const result = await metricModel.find({ metricName: req.body.metricData.metricName});
            if(result.length > 0){
                const resp = await metricModel.findOneAndUpdate({ metricName: req.body.metricData.metricName}, {scaleColors: req.body.metricData.scaleColors, scaleRanges: req.body.metricData.scaleRanges},{ upsert: true, new: true, setDefaultsOnInsert: true });
                res.status(201).json({message:'Atualizado.'});
            }
            else{
                const metric = new metricModel({metricName: req.body.metricData.metricName, scaleColors: req.body.metricData.scaleColors, scaleRanges: req.body.metricData.scaleRanges});
                const resp = await metric.save();
                res.status(201).json({message:'Criado.'});
            }
        }
        catch(err){
            console.log(err);
            return res.status(500);
        }
        
    }

    controller.AddMetric = async(req, res) => {
        mongoose.connect('mongodb://localhost:27017/metric', { useNewUrlParser: true, useUnifiedTopology: true }); // TODO Get url from appSettings
        const metricModel = mongoose.model('Metric', metricSchema);
        try{
            const metricExists = await metricModel.find({ metricName: req.body.metricData.metricName});
            if(metricExists.length > 0){
                res.status(400).json({message:'Já existe.'});
            }
            else{
                const metric = new metricModel({metricName: req.body.metricData.metricName, scaleColors: req.body.metricData.scaleColors, scaleRanges: req.body.metricData.scaleRanges});
                const resp = await metric.save();
                res.status(201).json({message:'Criado.'});
            }
        }
        catch(err){
            console.log(err);
            return res.status(500);
        }
    }

    controller.GetAllMetrics = async(req,res)=>{
        mongoose.connect('mongodb://localhost:27017/metric', { useNewUrlParser: true, useUnifiedTopology: true }); // TODO Get url from appSettings
        const metricModel = mongoose.model('Metric', metricSchema);
        let metrics = [];
        const docs = await metricModel.find({}).exec();
        res.status(200).json({metrics: docs});
    }

    controller.GetMetric = async (req, res) => {
        const metricName = req.query.metricName;
        mongoose.connect("mongodb://localhost:27017/metric",{ useNewUrlParser: true, useUnifiedTopology: true }); // TODO Get url from appSettings
        const metricModel = mongoose.model('Metric', metricSchema);
        try{
            const docs = await metricModel.findOne({'metricName': metricName}).exec();
            if(docs){
                res.status(200).json({metricRanges: docs._doc});
            }
            else{
                res.status(404).json({message:'Métrica não existe.'});
            }
        }
        catch(err){
            res.status(400).json({message:'Erro no pedido.'});
        }
    }        

    return controller;


    controller.set
}

const metricSchema = new mongoose.Schema({
        metricName: 'string',
        scaleColors: ['string'],
        scaleRanges: [Number]
});

const colorChartSchema = new mongoose.Schema({
    metric: 'string',
    range0: 'number',
    range1: 'number',
    range2: 'number',
    range3: 'number',
    range4: 'number',
  });
