// if (process.env.NODE_ENV !== "production") { // If we aren't in production mode (i.e. development mode) then upload environment variables
//     require('dotenv').config();
// }

require('dotenv').config(); //uncomment this if we want to start app in production mode from git bash
//
// setting app up - express, path, view engine
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');//package allowing to overide methods and use methods like PATCH/DELETE
const session = require('express-session');
const { v4: uuid } = require('uuid');//package for generating unique ids
uuid();
const mongoose = require('mongoose');
const { MongoClient } = require("mongodb");
// const { stockSchema } = require('./schemas.js');
const ejsMate = require('ejs-mate');
const Stock = require("./models/stock");
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const dotenv = require('dotenv');
const { STATUS_CODES } = require('http');
const { google } = require('googleapis');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user");
const MongoDBStore = require('connect-mongo');

dotenv.config();

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/stocky'; //url of our cloud database. We will connect to it once we are in production mode.

//***************Authentication with Gogle sheets****** */
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",

    scopes: "https://www.googleapis.com/auth/spreadsheets",
});



const usersRoutes = require('./routes/users'); 
const stocksViews = require('./routes/stocksViews'); 

 // Create client instance for auth
 var client = null;
 const clientStart = async () =>{
      client = await auth.getClient();
 }
 
 clientStart();
 

// Instance of Google Sheets API
const googleSheets = google.sheets({ version: "v4", auth: client });
const spreadsheetId = process.env.GoogleSheetID; // Id of sheet is kept in env file

//mongodb://localhost:27017/stocky - this is the address of our local database, the one we connect to with mongod



mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName: 'stock_data',
});


console.log(`connections number is ${mongoose.connections.length}`)
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log(`Stocky Database connected to ${dbUrl}`)
    for (c in db.collections){
        console.log(`collections are ${c}`)
    }
});


const app = express();
const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = new MongoDBStore({
mongoUrl: dbUrl,
secret,
touchAfter: 24 * 60 * 60 // Time for default saving of session data, instead of saving it on every 'refresh' action of the user. Specifies time in seconds.
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})
/// define properties of session
const sessionConfig = {
    store,
    name: 'session', //we hardcode a name so the browser wouldn't use the default name and make it easier for hackers to discover the session name and steal the session information
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true, # will be uncommented once we deploy. Allows cookies over https only (local host is http and not https)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //specifies time in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7 //specifies time in milliseconds
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));//specify to passport the authentication method we are using

passport.serializeUser(User.serializeUser()); //specify to passport how to store user in session
passport.deserializeUser(User.deserializeUser()); //specify to passport how to unstore user in session

app.use((req, res, next) => { ///middleware allowing flash variables and user data to be acessible from all templates as local variables. Should come before route handlers
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

app.use(express.static(path.join(__dirname, 'public')));//makes it possible to open this file from different folders
app.use(express.urlencoded({ extended: true }));//allows us to parse  html data from requests
app.use(express.json());//allows us to parse json data from requests
app.use(methodOverride('_method'));//alows us to overide GET/POST requests, thus we are able to send PATCH/DELETE requests

app.engine('ejs', ejsMate); //allows us to define a layout (boilerplate) file
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

app.use('', usersRoutes); //define path for all routes on users file. They must all start with the first argument (" " in this case)
app.use('', stocksViews); //define path for all routes on stocksViews file. They must all start with the first argument (" " in this case)

app.get("/fakeUser", async (req, res) => { ///testing addition of new user with passport
    const user = new User ({ email: '123@gmail.com', username: '123'});
    const newUser = await User.register (user, 'chick');
    res.send(newUser);
})

app.get("/upDateStocks", async (req, res) => {
    //var today = new Date(); //maybe useful in future
    //var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(); //maybe useful in future
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
    await res.send(getRows.data);
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
}
)

/////////////////////////function for updating stock values////////////////////////////////////

const updateSingleStock = async (newValues) => {
    let stockSymbol = newValues[0];
    let stockPrice = newValues[1];
    let stockChange = newValues[2];
    let stockChangePct = newValues[3];
    console.log("editing " + stockSymbol + "price to be:" + stockPrice)
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






