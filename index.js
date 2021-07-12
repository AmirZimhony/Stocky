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

app.get('/home', (req, res) => {
    res.render('home')
})

app.get('/stocks', catchAsync(async (req, res) => {
    const stocks = await Stock.find({});
    res.render('stocks/index', { stocks })
}))

app.get('/stocks/new', catchAsync(async (req, res) => {
    res.render('stocks/new')
}))

app.get('/stocks/:id', catchAsync(async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    res.render('stocks/show', { stock });
}))

app.get('/stocks/:id/edit', catchAsync(async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    res.render('stocks/edit', { stock });
}))

app.post('/stocks', catchAsync(async (req, res) => {
    // if (!req.body.stock) throw new ExpressError('Invalid stock data', 400)
    const stock = new Stock(req.body.stock);
    await stock.save();
    res.redirect(`/stocks/${stock._id}`)
}))

app.put('/stocks/:id',  catchAsync(async (req, res) => {
    const { id } = req.params;
    const stock = await Stock.findByIdAndUpdate(id, { ...req.body.stock })
    res.redirect(`/stocks/${stock._id}`)
}))

app.delete('/stocks/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Stock.findByIdAndDelete(id);
    res.redirect(`/stocks/`)
}))

app.get('/makestock', catchAsync(async (req, res) => {
    const singleStock = new Stock({ name: "apple", DateOfInitialPurchase: Date(), initialPurshaseSum: 5000 });
    await singleStock.save();
    res.send(singleStock)
}))


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