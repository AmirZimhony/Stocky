const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const stocks = require('../controllers/stocks');
const ExpressError = require('../utils/ExpressError');
const Stock = require('../models/stock');
const {isLoggedIn} = require('../middleware')



router.get('/home', (req, res) => {
    res.render('home')
})

router.get('/stocks', catchAsync(stocks.index));

router.get('/stocks/new', isLoggedIn, catchAsync(stocks.renderNewStock));

router.get('/stocks/:id', catchAsync(stocks.showStock))

router.get('/stocks/:id/edit', isLoggedIn, catchAsync(stocks.renderEdit))

router.post('/stocks', isLoggedIn, catchAsync(stocks.createNewStock))

router.put('/stocks/:id', isLoggedIn, catchAsync(stocks.updateStock))

router.delete('/stocks/:id', isLoggedIn, catchAsync(stocks.deleteStock))



module.exports = router;