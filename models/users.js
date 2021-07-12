const mongoose = require('mongoose');
const Stock = require("../models/stock");
const schema = mongoose.schema;

mongoose.connect('mongodb://localhost:27017/stocky', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Stocky Database connected from user.js")
});

const userSchema = new schema({
    first: String,
    last: String,
    stocks: [{type: schema.Types.ObjectId, ref: Stock}]
})

module.exports = mongoose.model('User', userSchema);