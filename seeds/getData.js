// irrelevant file at the moment

apiKey = 'hidden now';
apiHost = 'apidojo-yahoo-finance-v1.p.rapidapi.com';
axios = require('axios');

const config = { headers: { 'x-rapidapi-key': apiKey, 'x-rapidapi-host': apiHost , }  };

axios('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=WIX&region=US', config)
    .then(res => {
        console.log("response, waiting for parsing..", res)
        return res.data
    })
    .then(data => {
        console.log("data parsed..", data)
        console.log(data.financialData.currentPrice.raw)
    })
    .catch(e => {
        console.log('error dammit', e)
    })