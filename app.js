var elasticsearch = require('elasticsearch');
var express = require('express');
var request = require('request');

var client = new elasticsearch.Client({
    host: 'https://search-thewalkingdead-exfccwbflo273euwtaicjbxeye.us-west-1.es.amazonaws.com/',
    log: 'info'
});

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 5000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});


var app = express()

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')


    setInterval(function() {
        request("https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(%22YHOO%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=", function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var items = JSON.parse(body);
                var ID = items.query.results.quote.LastTradeWithTime;
                var date = items.query.results.quote.LastTradeDate;
                var price = parseInt(items.query.results.quote.LastTradePriceOnly);


                var temp = parseInt(date.replace("/", "").replace("/", ""))
                console.log(temp)

                client.create({
                    index: '.y',
                    type: 'stocks',
                    id: ID,
                    body: {pri: price, dat: temp}
                }, function (error, response) {
                    console.log("put item successfully.")
                })

            }
        })
    }, 60* 60 * 24 * 1000)


})