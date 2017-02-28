var express = require('express');
var bodyParser = require('body-parser');
var fs = require("fs");

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var usersFile = __dirname + "/" + "users.json";
var itemsFile = __dirname + "/" + "items.json";

var defaultNewUser = {
	"currentStorageItem" : "hands",
	"currentGatherTool" : "hands",
	"hands" : 1,
	"currentJob" : "No Current Job",
	"timers" : {
		"count" : 0,
	}
}

var dbReset = {
    "userCount": 0
}

app.get('/', function (req, res) {
	fs.readFile(usersFile, 'utf8', function (err, data) {
		res.writeHead(200, {'Content-Type': 'application/json'})
		res.end(data);
	});
})

app.get('/refresh', function (req, res) {
	var userId = req.query.currentUserId;

	fs.readFile(usersFile, 'utf8', function (err, data) {
		var data = refresh(userId, data);
		var result = JSON.stringify(data,null,4);

		fs.writeFile(usersFile, result, function(err) {
			if (err) {
				throw err;
				res.end("Failed to save user");
			}
			console.log('User updated successfully');
		});

		res.end(JSON.stringify(data[userId],null,4));
	});
})

// app.get('/makeTool', function (req, res) {
// 	console.log("-----START MAKE TOOL-----");
// 	var userId = req.query.currentUserId;
// 	var tool = req.query.tool;

// 	fs.readFile(usersFile, 'utf8', function (err, data) {
// 		var data = refresh(userId, data);
// 		console.log("-----MAKE TOOL AFTER REFRESH-----");
// 		var user = data[userId];
// 		var timers = user.timers

// 		var currentToolTimer = false;
// 		for (var tm in timers) {
// 			if (!timers.hasOwnProperty(tm) || tm === "count") continue;

// 			var timer = timers[tm];

// 			console.log("timer info: ", timer);
// 			if (timer.type === "gather") {
// 				currentTimer = true;
// 				break;
// 			}
// 		}
// 		if (currentTimer === true) {
// 			var message = "Already have a timer, not creating new one";
// 			console.log(message);
// 			res.end(message);
// 			return;
// 		}

// 		oldJob = user.currentJob;
// 		// TODO: Probabably need to change this text
// 		user.currentJob = "Making "+tool;
// 		makeToolTimer(userId, user.lastUpdate, oldJob, 10, tool);

// 		var result = JSON.stringify(data,null,4);
// 		fs.writeFile(usersFile, result, function(err) {
// 			if (err) {
// 				throw err;
// 				res.end("Failed to save created ", tool);
// 			}
// 			console.log(tool,"creation saved successfully");
// 		});
// 		console.log("-----END MAKE TOOL-----");

// 		res.end(JSON.stringify(user,null,4));
// 	});
// })

app.get('/explore', function (req, res) {
	res.end("Finished Exploring");
})

app.get('/changeJob', function (req, res) {
	console.log("-----START CHANGE JOB-----");
	var userId = req.query.currentUserId;
	var jobType = req.query.jobType;
	var collectedItem = req.query.collectedItem;
	var toolUsed = req.query.toolUsed;
	var storageItem = req.query.storageItem;
	// TODO: Make these readFile calls asynchronous
	fs.readFile(usersFile, 'utf8', function (usersErr, usersData) {
		var usersData = refresh(userId, usersData);
		var lastUpdate = usersData[userId].lastUpdate;
		usersData[userId].currentJob = jobType.concat(" ").concat(collectedItem);

		fs.readFile(itemsFile, 'utf8', function (itemsErr, itemsJSON) {
			var itemsData = JSON.parse(itemsJSON);
			if (jobType === "gather") {
				var speedMultiplier = itemsData.tools.harvest[toolUsed].speedMultiplier;
				var capacity = itemsData.tools.storage[toolUsed].capacity;
				var amountPerSecond = itemsData.actions.gathering[collectedItem].baseAmountPerSecond;
				var volumePerUnit = itemsData.resources[collectedItem].gatherVolumePerUnit;
				if (volumePerUnit == undefined) {
					volumePerUnit = itemsData.resources[collectedItem].volumePerUnit;
				}
				var amountCollected = capacity/volumePerUnit;
				var totalTime = Math.floor(amountCollected/(amountPerSecond*speedMultiplier));
			} else if (jobType === "craft") {
				var baseTimeToCraft = itemsData.actions.crafting[collectedItem].baseCraftTime;
				var amountCollected = itemsData.actions.crafting[collectedItem].baseNumberCrafted;
				var totalTime = baseTimeToCraft;
			}
			console.log("Before makeActionTimer");
			usersData = makeActionTimer(res, userId, lastUpdate, totalTime, jobType, collectedItem, amountCollected, usersData);

			var result = JSON.stringify(usersData,null,4);

			fs.writeFile(usersFile, result, function(writeErr) {
				if (writeErr) {
					throw writeErr;
					res.end("Failed to change job");
				}
				console.log('Job changed successfully');
			});
			console.log("-----END CHANGE JOB-----");
			response = {
				time:totalTime,
				amountCollected:amountCollected
			};
			res.end(JSON.stringify(response));
		});
	});
})
// TODO: Fix browser console error when creating new user
app.get('/addUser', function (req, res) {
	fs.readFile( usersFile, 'utf8', function (err, data) {
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


		fs.readFile(itemsFile, 'utf8', function (itemsErr, itemsJSON) {
			var itemsData = JSON.parse(itemsJSON);

			for (var resource in itemsData.resources) {
				data[newUserId][resource] = 0;
			}
			for (var item in itemsData.actions.crafting) {
				data[newUserId][item] = 0;
			}

			var result = JSON.stringify(data,null,4);
			fs.writeFile(usersFile, result, function(err) {
				if (err) {
					throw err;
					res.end("Failed to save user");
				}
				console.log('User saved successfully');
				res.end("User created successfully");
			});
		});
	});
})

app.get('/reset', function (req, res) {
	fs.writeFile(usersFile, JSON.stringify(dbReset,null,4), function(err) {
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

		var currentTime = new Date();

		 var lastUpdate = new Date(data[userId].lastUpdate);
		// var updatedRefreshDate = checkForTimer(user, lastUpdate, currentTime);
		checkForTimer(user, lastUpdate, currentTime);
		// var mult = (currentTime - updatedRefreshDate)/1000;
		// var job = user.currentJob;

		user.lastUpdate = currentTime;
		console.log("-----END REFRESH-----");

	return data;
}

function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds*1000);
}

function makeActionTimer(res, userId, lastUpdate, seconds, action, item, itemQuantity, data) {

	var defaultNewTimer = {
		"id" : 0,
		"endTime" : null,
		"type" : "",
		"item" : "",
		"itemQuantity" : 0
	}

	console.log("-----START MAKE ACTION TIMER-----");

	var timers = data[userId].timers;

	var user = data[userId];
	var currentTime = new Date();
	var lastUpdate = new Date(data[userId].lastUpdate);

	var newRefreshTime = checkForTimer(user, lastUpdate, currentTime);
	console.log("newRefreshTime: "+newRefreshTime);

	if (newRefreshTime !== lastUpdate) {
		console.log("A timer already exists, not creating new one");
		// TODO: Am I sure I want to send the response here?
		res.end("Existing Timer Error");
		console.log("-----END MAKE ACTION TIMER-----");
		return data;
	}

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

	// var result = JSON.stringify(data,null,4);
	// fs.writeFile(usersFile, result, function(err) {
	// 	if (err) {
	// 		throw err;
	// 		res.end("Failed to save in makeActionTimer");
	// 	}
	// 	console.log('Successfully saved in makeActionTimer');
	// });

	console.log("-----END MAKE ACTION TIMER-----");

	return data;
}

function checkForTimer(user, lastUpdate, currentTime) {
	console.log("-----START checkForTimer-----");
	var timers = user.timers
	var newRefreshTime = null;
	var currentTimer = false;

	for (var tm in timers) {
		if (!timers.hasOwnProperty(tm) || tm === "count") continue;

		var timer = timers[tm];
		var timerEndTime = new Date(timer.endTime);
		currentTimer = true;

		if (currentTime - timerEndTime > 0) {
			// TODO: simplify
			// if (timer.item === "berries") {
			// 	user.berries += timer.itemQuantity;
				user[timer.item] += timer.itemQuantity;
			// } else if (timer.item === "smallStones") {
			// 	user.smallStones += timer.itemQuantity;
			// } else if (timer.item === "sticks") {
			// 	user.sticks += timer.itemQuantity;
			// } else if (timer.item === "knockedStone") {
			// 	user.knockedStones += timer.itemQuantity;
			// }
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

	if (currentTimer === false) {
		console.log("No Timer, updating as usual");
		console.log("-----END checkForTimer-----");
		return lastUpdate;
	}
	console.log("-----END checkForTimer-----");

	return newRefreshTime;
}
