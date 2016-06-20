/**
 * Created by M6600 on 6/12/2016.
 */
var express = require('express');
var morgan = require('morgan'); // log plugin to log every requrest
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var connectMongo = require('connect-mongo/es5')(session ); // store session on server
var passport = require('passport');


var secret = require('./config/secret');
var User = require('./models/user');
var Category = require('./models/category');
var cartTotal = require('./middlewares/middlewares');

var app = express();
mongoose.connect(secret.database, function (err) {
	if (err) {
		console.log('connect to mongodb ERROR:', err);
	} else {
		console.log('connect to db: successful');
	}
});

//middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
	resave:true,//Forces the session to be saved back to the session store, even if the session was never modified during the request https://github.com/expressjs/session
	saveUninitialized:true,//Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
	secret:secret.secret,//This is the secret used to sign the session ID cookie.
	cookie:{maxAge:3600000}, // expire in 1 hour
	store: new connectMongo({url:secret.database,autoReconnect: true})
}));
app.use(flash()); // push messages to the front-end from middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req,res, next) {
	res.locals.user = req.user;// initiate user object for every request
	next();
});

app.use(cartTotal);

//create categories variable for every request
app.use(function (req,res, next) {
	Category.find({}, function (err,categories) {
		if(err) return next(err);
		res.locals.categories = categories;
		next();
	});
});
app.engine('ejs',ejsMate);
app.set('view engine','ejs');



var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);

app.listen(secret.port, function (err) {
	if (err) throw err;
	console.log('server is running on port '+ secret.port);
});