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

router.route('/stocks')
    .get(catchAsync(stocks.index))
    .post(isLoggedIn, catchAsync(stocks.createNewStock))

router.get('/stocks/new', isLoggedIn, catchAsync(stocks.renderNewStock));

router.route('/stocks/:id')
    .get(catchAsync(stocks.showStock))
    .put(isLoggedIn, catchAsync(stocks.updateStock))
    .delete(isLoggedIn, catchAsync(stocks.deleteStock))

router.get('/stocks/:id/edit', isLoggedIn, catchAsync(stocks.renderEdit))


module.exports = router;