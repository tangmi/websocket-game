
/**
* Module dependencies.
*/

var express = require('express')
	, routes = require('./routes')
	, user = require('./routes/user')
	, client = require('./routes/client')
	, http = require('http')
	, path = require('path');
	
/* mongodb setup */
var mongo = require('mongodb');
mongo.config = {
	host: process.env['DOTCLOUD_DB_MONGODB_HOST'] || 'localhost',
	port: parseInt(process.env['DOTCLOUD_DB_MONGODB_PORT'] ||  27017),
	user: process.env['DOTCLOUD_DB_MONGODB_LOGIN'] || undefined,
	pass: process.env['DOTCLOUD_DB_MONGODB_PASSWORD'] || undefined
}

var mongoServer = new mongo.Server(mongo.config.host, mongo.config.port, {});
var db = new mongo.Db("test", mongoServer, {auto_reconnect:true});

db.open(function(err){
	if(err) console.log(err);

	if(mongo.config.user && mongo.config.pass) {
		db.authenticate(mongo.config.user, mongo.config.pass, function(err) {
			// app.listen(8080);
		});
	}
	else {
		// app.listen(8080);
	}
});




var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 8080);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

var server = http.createServer(app);
server.listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/client', client.index);

// socket.io setup
var io = require('socket.io').listen(server);
io.set('log level', 2);

var game = require('./game');

game.init(io);


var pos = {
	x: 0,
	y: 40
}
setInterval(function() {
	pos.x++;
	if(pos.x > 400) {
		pos.x = 0;
	}
	game.update(pos);
}, 10);


