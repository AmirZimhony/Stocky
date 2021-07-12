const Joi = require('joi');

//don't be confused - this is stockSchema for VALIDATION of post/put requests, NOT the schema of the mongoose model
module.exports.stockSchema = Joi.object({
    stock: Joi.object({
        name: Joi.string().required(),
        ISIN: Joi.string().required(),
        indices: Joi.string().required(),
        price: Joi.number().required().min(0),
    }).required()
});

