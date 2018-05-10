/*
	Project: itNoodle
	Author: globalfarmer
	Description: itNoodle Service
*/

var express = require("express"),
	bodyParser = require('body-parser'),
	app = express();

var itnoodle = require('./project_modules/itnoodle.js');
var	MongoClient = require('mongodb').MongoClient;
var config = require('./config/config.json');

var student = require('./routes/student');
var announce = require('./routes/announce');


//public file
app.use(express.static(__dirname + '/public'));

// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
	console.log('Request: ' + req.url);
	next();
})

//route
app.use('/student', student);
app.use('/announce', announce);

MongoClient.connect(config.db.host, function(err, client) {
	if(err)
		console.log('MongoClient default connection error: ' + err);
	else {
		console.log('MongoClient default connection open to ' + config.db.host);
		// console.log(db.collection('slot').find());
		itnoodle.db = client.db(config.db.dbname);
		itnoodle.studentCol = itnoodle.db.collection('student');
		itnoodle.scoreboardCol = itnoodle.db.collection('scoreboard');
		itnoodle.announceCol = itnoodle.db.collection('announce');
		var server = app.listen(80, () => {
			console.log('Server started on port ' + 80);
		});
	}
});