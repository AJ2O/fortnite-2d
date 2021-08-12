/*
 * What about serving up static content, kind of like apache?
 * This time, you are required to present a user and password to the login route
 * before you can read any static content.
 */

var process = require('process');
// run ftd.js as

// nodejs ftd.js PORT_NUMBER
var port = parseInt(process.argv[2]);
var express = require('express');
var cookieParser = require('cookie-parser')

var app = express();
app.use(cookieParser()); // parse cookies before processing other middleware

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
const sqlite3 = require('sqlite3').verbose();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
})); // support encoded bodies

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
// will create the db if it does not exist
var db = new sqlite3.Database('db/database.db', (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the database.');
});

// For password encryption
var bcrypt = require('bcrypt');
const saltRounds = 10;

// For user session
var jwt = require('jsonwebtoken');
/*
// ----------------------------------------------------------------------------------
// BEGIN: To restrict access to /
// ----------------------------------------------------------------------------------
var user = "a2group80",
	password = "thenumber10"; // REPLACE THESE TO KEEP OTHERS OUT OF YOUR APPLICATION
var id = Math.random().toString(36).substring(2, 15) +
	Math.random().toString(36).substring(2, 15);

app.get('/login/:user/password/:password', function(req, res) {
	if (req.params.user == user && req.params.password == password) {
		res.cookie("id", id);
		res.send("Loggedin");
	} else {
		res.send("Login failed");
	}
});

// This is a checkpoint before allowing access to /zzs
app.use('/', function(req, res, next) {
	if (req.cookies.id == id) {
		next(); // continue processing routes
	} else {
		res.status(403).send('Not authorized');
	}
});
// ----------------------------------------------------------------------------------
// END: To restrict access to /
// ----------------------------------------------------------------------------------
*/
app.use('/', express.static('static_files')); // this directory has files to be returned

// Retrieve login information
app.get('/api/login/user/:username/pass/:password', function(req, res) {
	var username = req.params.username;
	var password = req.params.password;
	let sql = 'SELECT * FROM player WHERE username = ?;';

	db.get(sql, [username], (err, rows) => {
		var result = {};
		if (err) {
			res.status(400);
			result["error"] = err.message;
		} else {
			if (rows) {
				bcrypt.compare(password, rows["password"], function(err, result) {
					if (result) {
						jwt.sign({
							user: username
						}, 'WeSikWitIt', function(err, token) {
							result = {
								login: true,
								token: token,
								email: rows["email"],
								birthday: rows["birthday"],
								year: rows["year"],
								lecture: rows["lecture"],
							}
							console.log(JSON.stringify(result));
							res.json(result);
						});
					} else {
						res.status(400);
						result = {
							login: false
						}
						console.log(JSON.stringify(result));
						res.json(result);
					}
				});
			} else {
				res.status(404);
				result["login"] = false;
				console.log(JSON.stringify(result));
				res.json(result);
			}
		}
	});
});

// Password verification
app.get('/api/verifyPassword/user/:username/pass/:password', function(req, res) {
	var username = req.params.username;
	var password = req.params.password;
	let sql = 'SELECT * FROM player WHERE username = ?;';

	db.get(sql, [username], (err, rows) => {
		var result = {};
		if (err) {
			res.status(404);
			result["error"] = err.message;
		} else {
			bcrypt.compare(password, rows["password"], function(err, result) {
				if (result) {
					result = {
						same: true,
						global: true
					}
					console.log(JSON.stringify(result));
					res.json(result);
				} else {
					res.status(400);
					result = {
						same: false,
						global: false
					}
					console.log(JSON.stringify(result));
					res.json(result);
				}
			});
		}
	});
});

// Retrieve top ten scores
app.get('/api/topten', function(req, res) {
	let sql = 'SELECT username, score FROM player ORDER BY score DESC LIMIT 10;';
	db.all(sql, [], (err, rows) => {
		var result = {};
		result["scores"] = [];
		if (err) {
			console.log("error");
		} else {
			rows.forEach((row) => {
				result["scores"].push(row);
			});
		}
		console.log(JSON.stringify(result));
		res.json(result);
	});
});

// Create a new player
app.post('/api/register/', function(req, res) {
	var username = req.body.user;
	var password = req.body.pass;
	var email = req.body.email;
	var birthday = req.body.birth;
	var year = req.body.year;
	var lecture = req.body.lecture;
	var score = 1;
	let sql = 'INSERT INTO player(username, password, email, birthday, year, lecture, score) VALUES (?,?,?,?,?,?,?);';

	bcrypt.hash(password, saltRounds, function(err, hash) {
		if (hash) {
			db.run(sql, [username, hash, email, birthday, year, lecture, score], function(err) {
				var result = {};
				if (err) {
					res.status(409);
					result["error"] = err.message;
					result["register"] = false;
				} else {
					res.status(201);
					result["update"] = "updated rows: " + this.changes;
					result["register"] = true;
				}
				console.log(JSON.stringify(result));
				res.json(result);
			});
		}
	});
});

// Delete a player
app.delete('/api/deleteAccount/user/:username', function(req, res) {
	var username = req.params.username;
	let sql = 'DELETE FROM player WHERE username = ?;';

	db.run(sql, [username], (err, rows) => {
		var result = {};
		if (err) {
			res.status(404);
			result["error"] = err.message;
			result["delete"] = false;
		} else {
			result["delete"] = true;
		}
		console.log(JSON.stringify(result));
		res.json(result);
	});
});

// Update a player
app.put('/api/update/user/:username', function(req, res) {
	var username = req.params.username;
	var password = req.body.pass;
	var birthday = req.body.birthday;
	var email = req.body.email;
	var year = req.body.year;
	var lecture = req.body.lecture;
	let sql = "UPDATE player SET password=?, email=?, birthday=?, year=?, lecture=? WHERE username=?";

	bcrypt.hash(password, saltRounds, function(err, hash) {
		if (hash) {
			db.run(sql, [hash, email, birthday, year, lecture, username], function(err) {
				var result = {};
				if (err) {
					res.status(404);
					result["error"] = err.message;
				} else {
					if (this.changes != 1) {
						result["error"] = "Not updated";
						res.status(404);
					} else {
						result["username"] = "updated rows: " + this.changes;
					}
				}
				res.json(result);
			});
		}
	});
});

// Update a player score
app.put('/api/updateScore/user/:username', function(req, res) {
	var username = req.params.username;
	var password = req.body.pass;
	var score = req.body.score;
	let sql = "UPDATE player SET score=? WHERE username=?";

	bcrypt.hash(password, saltRounds, function(err, hash) {
		if (hash) {
			db.run(sql, [score, username], function(err) {
				var result = {};
				if (err) {
					res.status(404);
					result["error"] = err.message;
				} else {
					if (this.changes != 1) {
						result["error"] = "Not updated";
						res.status(404);
					} else {
						result["username"] = "updated rows: " + this.changes;
					}
				}
				res.json(result);
			});
		}
	});
});

app.listen(port, function() {
	console.log('Example app listening on port ' + port);
});

// db.close();
