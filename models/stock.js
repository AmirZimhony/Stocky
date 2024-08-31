const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const StocksSchema = new mongoose.Schema({
    serial_number: Number,
    change: String,
    company: String,
    country: String,
    industry: String,
    market_cap: String,
    pe_ratio: String,
    price: Number,
    sector: String,
    ticker: String,
    volume: String,
    accumulatedChange: Number,
    numOfRisingDays: Number
}, {collection: 'stocks'});


module.exports = mongoose.model('Stock', StocksSchema)    