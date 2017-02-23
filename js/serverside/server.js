var express = require('express');
var bodyParser = require('body-parser')
var fs = require("fs");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var jsonFile = __dirname + "/" + "users.json";

// TODO: Generate based on items.json
var defaultNewUser = {
	"food" : 0,
	"wood" : 0,
	"stone" : 0,
	"berries" : 0,
	"smallStones" : 0,
	"sticks" : 0,
	"hands" : 1,
	"stoneBowl" : 0,
	"level" : 1,
	"population" : 1,
	"hatchets" : 0,
	"pickaxes" : 0,
	"sickles" : 0,
	"currentJob" : "Gather Food",
	"timers" : {
		"count" : 0,
	},
}

var dbReset = {
    "userCount": 0
}

app.get('/', function (req, res) {
	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		res.writeHead(200, {'Content-Type': 'application/json'})
		res.end(data);
	});
})

app.get('/refresh', function (req, res) {
	var userId = req.query.currentUserId;

	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		var data = refresh(userId, data);
		var result = JSON.stringify(data,null,4);

		fs.writeFile(jsonFile, result, function(err) {
			if (err) {
				throw err;
				res.end("Failed to save user");
			}
			console.log('User updated successfully');
		});

		res.end(JSON.stringify(data[userId],null,4));
	});
})

app.get('/makeTool', function (req, res) {
	console.log("-----START MAKE TOOL-----");
	var userId = req.query.currentUserId;
	var tool = req.query.tool;

	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		var data = refresh(userId, data);
		console.log("-----MAKE TOOL AFTER REFRESH-----");
		var user = data[userId];
		var wood = user.wood;
		var stone = user.stone;
		var hatchets = user.hatchets;
		var pickaxes = user.pickaxes;
		var sickles = user.sickles;
		var timers = user.timers

		var currentToolTimer = false;
		for (var tm in timers) {
			if (!timers.hasOwnProperty(tm) || tm === "count") continue;

			var timer = timers[tm];

			console.log("timer info: ", timer);
			if (timer.type === "Making Hatchet" || timer.type === "Making Pickaxe" || timer.type === "Making Sickle") {
				currentToolTimer = true;
				break;
			}
		}
		if (currentToolTimer === true) {
			var message = "Already have a tool timer, not creating new one";
			console.log(message);
			res.end(message);
			return;
		}

		if (wood >= 10 && stone >= 10) {
			user.wood -= 10;
			user.stone -= 10;
			oldJob = user.currentJob;
			user.currentJob = "Making "+tool;
			makeToolTimer(userId, user.lastUpdate, oldJob, 10, tool);
		}

		var result = JSON.stringify(data,null,4);
		fs.writeFile(jsonFile, result, function(err) {
			if (err) {
				throw err;
				res.end("Failed to save created ", tool);
			}
			console.log(tool,"creation saved successfully");
		});
		console.log("-----END MAKE TOOL-----");

		res.end(JSON.stringify(user,null,4));
	});
})

app.get('/explore', function (req, res) {

	res.end("Finished Exploring");
})

app.get('/changeJob', function (req, res) {
	console.log("-----START CHANGE JOB-----");
	console.log(req.query.newJob);
	var userId = req.query.currentUserId;
	var newJob = req.query.newJob;
	var collectedItem = req.query.collectedItem;
	var toolUsed = req.query.toolUsed;
	var storageItem = req.query.storageItem;

	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (usersErr, usersData) {
		var usersData = refresh(userId, usersData);
		var lastUpdate = usersData[userId].lastUpdate;
		usersData[userId].currentJob = newJob;
		var result = JSON.stringify(usersData,null,4);

		fs.readFile( __dirname + "/" + "items.json", 'utf8', function (itemsErr, itemsJSON) {
			var itemsData = JSON.parse(itemsJSON);
			var speedMultiplier = itemsData.tools.harvest[toolUsed].speedMultiplier;
			var capacity = itemsData.tools.storage[toolUsed].capacity;
			var amountPerSecond = itemsData.actions.gathering[collectedItem].baseAmountPerSecond;
			var volumePerUnit = itemsData.resources[collectedItem].gatherVolumePerUnit;
			if (volumePerUnit == undefined) {
				volumePerUnit = itemsData.resources[collectedItem].volumePerUnit;
			}
			var amountCollected = capacity/volumePerUnit;
			var maxTime = Math.floor(amountCollected/(amountPerSecond*speedMultiplier));
			// TODO: make actionType dynamic
			makeActionTimer(userId, lastUpdate, maxTime, "gather", collectedItem, amountCollected);

			fs.writeFile(jsonFile, result, function(writeErr) {
				if (writeErr) {
					throw writeErr;
					res.end("Failed to change job");
				}
				console.log('Job changed successfully');
			});
			console.log("-----END CHANGE JOB-----");
			response = {
				time:maxTime,
				amountCollected:amountCollected
			};
			res.end(JSON.stringify(response));
		});
	});
})

app.post('/addUser', function (req, res) {
	fs.readFile( jsonFile, 'utf8', function (err, data) {
		var data = JSON.parse(data);
		var userCount = data.userCount;
		userCount++;
		console.log("UserCount: " + userCount);

		var newUserId = "user" + userCount;
		console.log("newUserid: " + newUserId);

		data[newUserId] = defaultNewUser;
		data[newUserId].id = userCount;
		data[newUserId].name = req.body.name;
		data[newUserId].lastUpdate = new Date();
		data.userCount = userCount;


		var result = JSON.stringify(data,null,4);
		fs.writeFile(jsonFile, result, function(err) {
			if (err) {
				throw err;
				res.end("Failed to save user");
			}
			console.log('User saved successfully');
			res.end("User created successfully");
		});
	});
})

app.get('/reset', function (req, res) {
	fs.writeFile(jsonFile, JSON.stringify(dbReset,null,4), function(err) {
		if (err) {
			throw err;
			res.end("Failed to reset DB");
		}
		console.log('Reset DB successfully');
		res.end("Reset DB successfully");
	});
})

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})

function refresh(userId, data) {
		console.log("-----START REFRESH-----");

		var data = JSON.parse(data);
		var user = data[userId];

		// console.log("Current User ID: " + userId);

		var lastUpdate = new Date(data[userId].lastUpdate);
		var currentTime = new Date();
		var updatedRefreshDate = checkForTimer(user, lastUpdate, currentTime);
		var mult = (currentTime - updatedRefreshDate)/1000;
		// console.log("Time difference in seconds: " + mult);

		var food = user.food;
		// console.log("Food: " + food);
		var wood = user.wood;
		// console.log("Wood: " + wood);
		var stone = user.stone;
		// console.log("Stone: " + stone);
		var level = user.level;
		// console.log("Level: " + level);
		var population = user.population;
		// console.log("Population: " + population);
		var hatchets = user.hatchets;
		// console.log("Hatchets: " + hatchets);
		var pickaxes = user.pickaxes;
		// console.log("Pickaxes: " + pickaxes);
		var sickles = user.sickles;
		// console.log("Sickles: " + sickles);
		var job = user.currentJob;
		// console.log("Current Job: " + job);

		if (job === "Gather Food") {
			food = Number(Number(food += (level*population + Math.min(sickles, population))*mult).toFixed(2));
			console.log("Updated Food: " + food);
			user.food = food;
		}
		if (job === "Gather Wood") {
			wood = Number(Number(wood += (level*population + Math.min(hatchets, population))*mult).toFixed(2));
			console.log("Updated Wood: " + wood);
			user.wood = wood;
		}
		if (job === "Gather Stone") {
			stone = Number(Number(stone += (level*population + Math.min(pickaxes, population))*mult).toFixed(2));
			console.log("Updated Stone: " + stone);
			user.stone  = stone;
		}
		user.lastUpdate = currentTime;
		console.log("-----END REFRESH-----");

	return data;
}

function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds*1000);
}

function makeToolTimer(userId, lastUpdate, oldJob, seconds, tool) {

	var defaultNewTimer = {
		"id" : 0,
		"oldJob" : "",
		"endTime" : null,
		"type" : "",
	}

	console.log("-----START MAKE TOOL TIMER-----");
	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		var data = refresh(userId, data);
		var timers = data[userId].timers;


		var timerCount = timers.count;
		timerCount++;
		timers.count = timerCount;

		var newTimerId = "timer" + timerCount;
		timers[newTimerId] = defaultNewTimer;
		timers[newTimerId].id = timerCount;
		timers[newTimerId].oldJob = oldJob;
		timers[newTimerId].type = "Making "+tool;

		timers[newTimerId].endTime = addSeconds(lastUpdate, seconds);

		var result = JSON.stringify(data,null,4);
		fs.writeFile(jsonFile, result, function(err) {
			if (err) {
				throw err;
				res.end("Failed to save in makeToolTimer");
			}
			console.log('Successfully saved in makeToolTimer');
		});
	});

	console.log("-----END MAKE TOOL TIMER-----");
}

function makeActionTimer(userId, lastUpdate, seconds, action, item, itemQuantity) {

	var defaultNewTimer = {
		"id" : 0,
		"endTime" : null,
		"type" : "",
		"item" : "",
		"itemQuantity" : 0
	}

	console.log("-----START MAKE ACTION TIMER-----");
	fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
		var data = refresh(userId, data);
		var timers = data[userId].timers;


		var timerCount = timers.count;
		timerCount++;
		timers.count = timerCount;

		var newTimerId = "timer" + timerCount;
		timers[newTimerId] = defaultNewTimer;
		timers[newTimerId].id = timerCount;
		timers[newTimerId].type = action;
		timers[newTimerId].item = item;
		timers[newTimerId].itemQuantity = itemQuantity;

		timers[newTimerId].endTime = addSeconds(lastUpdate, seconds);

		var result = JSON.stringify(data,null,4);
		fs.writeFile(jsonFile, result, function(err) {
			if (err) {
				throw err;
				res.end("Failed to save in makeActionTimer");
			}
			console.log('Successfully saved in makeActionTimer');
		});
	});

	console.log("-----END MAKE ACTION TIMER-----");
}

function checkForTimer(user, lastUpdate, currentTime) {
	console.log("-----START checkForTimer-----");
	var timers = user.timers
	var newRefreshTime = null;
	var currentTimer = false;

	for (var tm in timers) {
		if (!timers.hasOwnProperty(tm) || tm === "count") continue;

		var timer = timers[tm];
		// TODO: Simplify to just craft or gather timer check, perhaps remove entirely
		if (timer.type === "Making Hatchet" || timer.type === "Making Pickaxe" || timer.type === "Making Sickle" || timer.type === "gather") {
			var timerEndTime = new Date(timer.endTime);
			currentTimer = true;

			if (currentTime - timerEndTime > 0) {
				// TODO: simplify
				if (timer.type === "Making Hatchet") {
					user.hatchets += 1;
				} else if (timer.type === "Making Pickaxe") {
					user.pickaxes += 1;
				} else if (timer.type === "Making Sickle") {
					user.sickles += 1;
				} else if (timer.item === "berries") {
					user.berries += timer.itemQuantity;
				} else if (timer.item === "smallStones") {
					user.smallStones += timer.itemQuantity;
				} else if (timer.item === "sticks") {
					user.sticks += timer.itemQuantity;
				}
				newRefreshTime = timerEndTime;
				timers.count -= 1;
				// TODO: I may not be deleting the correct timer, especially if I expand this behavior to multiple active timers
				delete timers[tm];
				user.currentJob = timer.oldJob;
				console.log("Timer completed, prorating resource update");
			} else {
				console.log("Timer still running, not updating resources");
				newRefreshTime = currentTime;
			}
			break;
		}
	}

	if (currentTimer === false) {
		console.log("No Timer, updating as usual");
		console.log("-----END checkForTimer-----");
		return lastUpdate;
	}
	console.log("-----END checkForTimer-----");

	return newRefreshTime;
}
