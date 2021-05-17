const mongoose = require('mongoose');
const stockList = require('./stocklist')
const Stock = require("../models/stock");
const stocklist = require('./stocklist');


mongoose.connect('mongodb://localhost:27017/stocky', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Stocky Database connected")
});

const seedDB = async () => {
    await Stock.deleteMany({});
    for (let i=0; i<489; i++){
        const stock = new Stock({
            price: ((stockList[i]['Closing Price (0.01 NIS)'] !== null) ? `${stockList[i]['Closing Price (0.01 NIS)']}` : 0), 
            name: `${stocklist[i]['Name']}`,
            ISIN: `${stocklist[i]['ISIN']}`,
            indices: `${stocklist[i]['Index']}`
        })
        await stock.save();
    }
}

seedDB().then(()=> {
    mongoose.connection.close()
})