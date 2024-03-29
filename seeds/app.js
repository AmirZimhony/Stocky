// file for updating stocks in DB.
// *currently only inserts stocks from seeding JSON file. Need to add condition that checks if stock is in DB already --> then do not modify it.
// currently does not address the problem of removing stocks that are no longer relevant from DB/API

const mongoose = require('mongoose');
const stockList = require('./stocklist')
const Stock = require("../models/stock");


mongoose.connect('mongodb://localhost:27017/stocky', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Stocky Database connected from app.js. Seeding ourDB with stocks.")
});

const seedDB = async () => {
    await Stock.deleteMany({});
    for (let i=0; i<stockList.length; i++){
        const stock = new Stock({
            Symbol: `${stockList[i]['Symbol']}`,
            Name: `${stockList[i]['Name']}`,
            prevPrice: ((stockList[i]['Last Sale'] !== null) ? `${stockList[i]['Last Sale']}` : 0), 
            MarketCap: `${stockList[i]['Market Cap']}`,
            Country: `${stockList[i]['Country']}`,
            IPOYear: `${stockList[i]['IPO Year']}`,
            Volume: `${stockList[i]['Volume']}`,
            Sector: `${stockList[i]['Sector']}`,
            Industry: `${stockList[i]['Industry']}`,
            numOfRisingDays: 0,
            accumulatedChange: 0

        })
        await stock.save();
    }
}

seedDB().then(()=> {
    mongoose.connection.close()
})