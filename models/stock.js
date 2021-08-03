const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//----------define our database structure----------

const StockSchema = new mongoose.Schema({
    Symbol: String,
    Name: String,
    prevPrice: String,
    MarketCap: Number,
    Country: String,
    IPOYear: Number,
    Volume: Number,
    Sector: String,
    Industry: String,
    numOfRisingDays: Number,
    accumulatedChange: Number
});

module.exports = mongoose.model('Stock', StockSchema)