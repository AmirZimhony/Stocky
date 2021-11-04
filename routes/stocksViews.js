const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Stock = require('../models/stock');
const {isLoggedIn} = require('../middleware')



router.get('/home', (req, res) => {
    res.render('home')
})

router.get('/stocks', catchAsync(async (req, res) => {
    const stocks = await Stock.find({});
    res.render('stocks/index', { stocks })
}))

router.get('/stocks/new', isLoggedIn, catchAsync(async (req, res) => {
    res.render('stocks/new')
}))

router.get('/stocks/:id', catchAsync(async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    if (!stock){
        req.flash('error', " No such a stock exists in Database");
        return res.redirect('stocks/index');
    }
    res.render('stocks/show', { stock });
}))

router.get('/stocks/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const stock = await Stock.findById(req.params.id);
    res.render('stocks/edit', { stock });
}))

router.post('/stocks', isLoggedIn, catchAsync(async (req, res) => {
    // if (!req.body.stock) throw new ExpressError('Invalid stock data', 400)
    const stock = new Stock(req.body.stock);
    await stock.save();
    req.flash('success', 'successfully created a new stock!');
    res.redirect(`/stocks/${stock._id}`)
}))

router.put('/stocks/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const stock = await Stock.findByIdAndUpdate(id, { ...req.body.stock })
    console.log("updated values passed are:", { ...req.body.stock })
    res.redirect(`/stocks/${stock._id}`)
}))

router.delete('/stocks/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Stock.findByIdAndDelete(id);
    req.flash('success','Successfully deleted stock!');
    res.redirect(`/stocks/`)
}))



module.exports = router;