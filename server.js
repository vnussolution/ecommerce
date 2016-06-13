/**
 * Created by M6600 on 6/12/2016.
 */
var express = require('express');
var morgan = require('morgan'); // log plugin to log every requrest

var app = express();

app.use(morgan('dev'));

app.get('/frank', function (req,res) {
	var name = 'frank';
	res.json('my name is ' + name);
});

app.get('/', function (req,res) {
	var name = 'batman';
	res.json('my name is ' + name);
});

app.listen(3000, function (err) {
	if(err) throw err;
	console.log('server is running on port 3000');
})