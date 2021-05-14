//setting app up - express, path, view engine
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');//package allowing to overide methods and use methods like PATCH/DELETE
const { v4: uuid } = require('uuid');//package for generating unique ids
uuid();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/stocky', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongo CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR in Mongo!!!!")
        console.log(err)
    })


    //----------define our database structure----------
    const StockSchema = new mongoose.Schema({
        name: String,
        DateOfInitialPurchase: String,
        initialPurshaseSum: Number,
        price: Number
    });


const Stock = mongoose.model('stock', StockSchema);
const apple = new Stock({name: "apple", DateOfInitialPurchase: Date(), initialPurshaseSum: 5000});

Stock.insertMany([{name: "appleee", DateOfInitialPurchase: Date(), initialPurshaseSum: 5000},apple]);


app.use(express.static(path.join(__dirname, 'public')));//makes it possible to open this file from different folders
app.use(express.urlencoded({ extended:true }));//allows us to parse  html data from requests
app.use(express.json());//allows us to parse json data from requests
app.use(methodOverride('_method'));//alows us to overide GET/POST requests, thus we are able to send PATCH/DELETE requests

app.set('view engine', 'ejs');//determining engine for injecting variables into pages
app.set('views', path.join(__dirname, '/views'));//makes it possible to open this file from different folders


//defining responses to different requests

app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('*',(req,res)=>{
    res.send('404 here loser')
})


//defining port to listen on - 3000 for Andre 3000
app.listen(3000, () => {
    console.log('listening...')
}
)