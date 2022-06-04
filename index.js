const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

// http://localhost:3000 으로 접속시 /Home.html로 redirect 시켜줍니다.
app.get('/', (req, res) => res.redirect('/Home.html'))

// upbit api 호출 부분입니다. From public/javascript.js --> upbitchange
app.get('/upbit', function(req,res){
    var request = require('request');
    var options = {
        'method': 'GET',
        'url': 'https://api.upbit.com/v1/ticker?markets=KRW-BTC',
    };
    request(options, function (error, response) { 
        if (error) throw new Error(error);
        res.send(response.body);
    });
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))