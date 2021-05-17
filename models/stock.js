const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//----------define our database structure----------

const StockSchema = new mongoose.Schema({
    name: String,
    DateOfInitialPurchase: String,
    ISIN: String,
    initialPurchaseSum: Number,
    price: Number,
    indices: String
});

module.exports = mongoose.model('Stock', StockSchema)