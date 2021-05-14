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



mongoose.connect('mongodb://localhost:27017/movieApp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    })

    //----------practice mongo----------
    const loserSchema = new mongoose.Schema({
        name: String,
        reason: String,
        age: Number
    });

const Loser = mongoose.model('Loser', loserSchema);
const ami = new Loser({name: "ami", reason: "virgin", age: 22});

Loser.insertMany([{name:'app', reason: 'blue', age: 22}, {name: 'howard', reason: 'losie', age: 29}, ami])
app.use(express.static(path.join(__dirname, 'public')));//makes it possible to open this file from different folders
app.use(express.urlencoded({ extended:true }));//allows us to parse  html data from requests
app.use(express.json());//allows us to parse json data from requests
app.use(methodOverride('_method'));//alows us to overide GET/POST requests, thus we are able to send PATCH/DELETE requests

app.set('view engine', 'ejs');//determining engine for injecting variables into pages
app.set('views', path.join(__dirname, '/views'));//makes it possible to open this file from different folders

let losers = [
    {
        id:uuid(),
        name: 'dan',
        reason: 'virgin'
    },
    {
        id:uuid(),
        name: 'don',
        reason: 'copycat'
    },
    {
        id:uuid(),
        name: 'danny',
        reason: 'weak'
    }
]



//defining responses to different requests
app.get('/home',(req,res)=>{
    res.render('home')
})

app.get('/loserform',(req,res)=>{
    res.render('loser form')
})

app.get('/sampleform',(req,res)=>{
    res.render('sampleLoser')
})


app.get('/losers/loserlist',(req,res)=>{
    res.render('losers/losers list')
})

app.get('/losers',(req,res)=>{
    res.render('losers/index', { losers } )
})



    //----------define our database structure----------
    const StockSchema = new mongoose.Schema({
        name: String,
        DateOfInitialPurchase: String,
        initialPurshaseSum: Number
    });


const Stock = mongoose.model('stock', StockSchema);
const apple = new Stock({name: "applw", DateOfInitialPurchase: Date(), initialPurshaseSum: 5000});

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