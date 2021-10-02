// setting app up - express, path, view engine
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');//package allowing to overide methods and use methods like PATCH/DELETE
const { v4: uuid } = require('uuid');//package for generating unique ids
uuid();
const mongoose = require('mongoose');
// const { stockSchema } = require('./schemas.js');
const Stock = require("./models/stock");
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { STATUS_CODES } = require('http');
const { google } = require('googleapis');

//***************Authentication with Gogle sheets****** */
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",

    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const stocksViews = require('./routes/stocksViews');

 // Create client instance for auth
 var client = null;
 const clientStart = async () =>{
      client = await auth.getClient();
 }
 
 clientStart();
 

// Instance of Google Sheets API
const googleSheets = google.sheets({ version: "v4", auth: client });
const spreadsheetId = '1j4A9tXOIMpZ9tnve5iEcvxJJxy3L1U-5Yjulxhgj9t0';


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

const app = express();


app.use(express.static(path.join(__dirname, 'public')));//makes it possible to open this file from different folders
app.use(express.urlencoded({ extended: true }));//allows us to parse  html data from requests
app.use(express.json());//allows us to parse json data from requests
app.use(methodOverride('_method'));//alows us to overide GET/POST requests, thus we are able to send PATCH/DELETE requests

app.set('view engine', 'ejs');//determining engine for injecting variables into pages
app.set('views', path.join(__dirname, '/views'));//makes it possible to open this file from different folders


// const validateStock = (req, res, next) => {
//     const { error } = stockSchema.validate(req.body);
//     if (error) {
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg, 400);
//     }
//     else {
//         next();
//     }
// }

//defining responses to different requests


app.use('', stocksViews); //define path for all routes on stocksViews file. They must all start with the first argument ("/stocks")

app.get("/upDateStocks", async (req, res) => {
     
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Sheet1!A:D",
    });
    console.log("specific data is " + getRows.data.values[1][0]);
    //  updateSingleStock(getRows.data.values[7]); ///here for testing the update of a single stock. 
    for (let i = 1; i < getRows.data.values.length; i++) {
        updateSingleStock(getRows.data.values[i]);
    }
    await res.send(getRows.data)
})

app.all('*', (req, res, next) => {
    next(new ExpressError('404 here loser', 404))
})


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Shit, something went wrong!';
    res.status(statusCode).render('error', { err });
})

//defining port to listen on - 3000 for Andre 3000
app.listen(3000, () => {
    console.log('listening...')
}
)

/////////////////////////function for updating stock values////////////////////////////////////

const updateSingleStock = async (newValues) => {
    let stockSymbol = newValues[0];
    let stockPrice = newValues[1];
    let stockChange = newValues[2];
    let stockChangePct = newValues[3];
    console.log("editing" + stockSymbol + "price to be:" + stockPrice)
    let risingDays = 0;
    let incrementalChange = 0;
    const risingStock = await Stock.find({ Symbol: stockSymbol }).then((result) => {
        let stockFromDb = result[0];
        if (stockChangePct > 0) { //in case the stock price has increased
            if (stockFromDb.numOfRisingDays < 0) {//in case trend of stock has changed
                risingDays = 1;
                incrementalChange = stockChangePct;
            }
            else {
                risingDays = stockFromDb.numOfRisingDays + 1;
                incrementalChange = stockFromDb.accumulatedChange + Number(stockChangePct);
            }
        }
        else
            if (stockChangePct < 0) {//in case the stock price has decreased
                if (stockFromDb.numOfRisingDays > 0) {//in case trend of stock has changed
                    risingDays = -1;
                    incrementalChange = Number(stockChangePct);
                }
                else {
                    risingDays = stockFromDb.numOfRisingDays - 1;
                    incrementalChange = stockFromDb.accumulatedChange + Number(stockChangePct);
                }
            }
    }).then(async () => {
        await Stock.updateOne({ Symbol: stockSymbol }, { prevPrice: stockPrice, numOfRisingDays: risingDays, accumulatedChange: incrementalChange }).then((res => { console.log(res) }));
        console.log("rising days for stock " + stockSymbol + " is: " + risingDays);
        console.log("incremental change for stock " + stockSymbol + " is: " + incrementalChange);
    }).catch(err => {
        console.log("due to " + err + " the stock " + stockSymbol + " must be reassesed in the database.");
    })

}

        // console.log("stock name is"+name);
        // let risingDays = risingStock.numOfRisingDays;
        // console.log ("stock data found is damn "+risingStock )
        // console.log ("risingDays should now be 1, its : "+risingStock.Name )






