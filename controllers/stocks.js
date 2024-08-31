const { healthcare } = require('googleapis/build/src/apis/healthcare');
const Stock = require('../models/stock');
const Stocks = require('../models/stockOrig');


module.exports.index = async (req, res) => {
    const stocks = await Stock.find({});
    console.log("in stocks path")
    // console.log(stocks)
    res.render('stocks/index', { stocks })
}

module.exports.renderNewStock = async (req, res) => {
    res.render('stocks/new') 
}

module.exports.createNewStock = async (req, res) => {
    // if (!req.body.stock) throw new ExpressError('Invalid stock data', 400)
    const stock = new Stock(req.body.stock);
    await stock.save();
    req.flash('success', 'successfully created a new stock!');
    res.redirect(`/stocks/${stock._id}`)
}

module.exports.showStock = async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', " No such a stock exists in Database");
        return res.redirect('stocks/index');
    }
    res.render('stocks/show', { stock });
}

module.exports.renderEdit = async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    res.render('stocks/edit', { stock });
}

module.exports.updateStock = async (req, res) => {
    const { id } = req.params;
    const stock = await Stock.findByIdAndUpdate(id, { ...req.body.stock })
    console.log("updated values passed are:", { ...req.body.stock })
    req.flash('success', 'successfully updated a stock!');
    res.redirect(`/stocks/${stock._id}`)
}

module.exports.deleteStock = async (req, res) => {
    const { id } = req.params;
    await Stock.findByIdAndDelete(id);
    req.flash('success','Successfully deleted stock!');
    res.redirect(`/stocks/`)
}