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

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)
})

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
		var errorList = [];
		var usersData = refresh(userId, usersData);
		var user = usersData[userId];
		var lastUpdate = user.lastUpdate;
		user.currentJob = jobType.concat(" ").concat(collectedItem);

		fs.readFile(itemsFile, 'utf8', function (itemsErr, itemsJSON) {
			var itemsData = JSON.parse(itemsJSON);
			var itemCost = {};
			var craftingProficiency = null;

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

				craftingProficiency = user[collectedItem].proficiency;

				for (var resource in itemsData.actions.crafting[collectedItem].resources) {
					var resourceCost = itemsData.actions.crafting[collectedItem].resources[resource];
					var userResourceQty = user[resource];


					itemCost[resource] = resourceCost;

					if (userResourceQty < resourceCost) {
						errorList.push("Insufficient Resources Error: "+resource);
					}
				}

				if (errorList.length > 0) {
					res.end(errorList[0]);
					console.log(errorList[0]);
					console.log("-----END CHANGE JOB-----");
					return;
				}
			}

			usersData = makeActionTimer(userId, lastUpdate, totalTime, jobType, collectedItem, amountCollected, usersData, itemCost, craftingProficiency, errorList);
			if (errorList.length > 0) {
				res.end(errorList[0]);
				console.log(errorList[0]);
				console.log("-----END CHANGE JOB-----");
				return;
			}

			for (var resource in itemCost) {
				user[resource] -= itemCost[resource];
			}

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
				amountCollected:amountCollected,
				itemCost
			}
			res.end(JSON.stringify(response));
		});
	});
})

app.get('/addUser', function (req, res) {

	var defaultNewUser = {
		"currentStorageItem" : "hands",
		"currentGatherTool" : "hands",
		"hands" : 1,
		"currentJob" : "No Current Job",
		"timers" : {
			"count" : 0,
		}
	}

	fs.readFile( usersFile, 'utf8', function (err, data) {
		var data = JSON.parse(data);
		var userCount = data.userCount;
		userCount++;
		console.log("UserCount: " + userCount);

		var newUserId = "user" + userCount;
		console.log("newUserid: " + newUserId);

		data[newUserId] = defaultNewUser;
		data[newUserId].id = userCount;
		data[newUserId].name = req.query.name;
		data[newUserId].lastUpdate = new Date();
		data.userCount = userCount;


		fs.readFile(itemsFile, 'utf8', function (itemsErr, itemsJSON) {
			var itemsData = JSON.parse(itemsJSON);

			for (var resource in itemsData.resources) {
				data[newUserId][resource] = 0;
			}
			for (var itemName in itemsData.actions.crafting) {
				data[newUserId][itemName] = {};
				data[newUserId][itemName].count = 0;

				data[newUserId][itemName].proficiency = itemsData.actions.crafting[itemName].baseQuality;
				data[newUserId][itemName].qualities = [];
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

	var dbReset = {
	    "userCount": 0
	}

	fs.writeFile(usersFile, JSON.stringify(dbReset,null,4), function(err) {
		if (err) {
			throw err;
			res.end("Failed to reset DB");
		}
		console.log('Reset DB successfully');
		res.end("Reset DB successfully");
	});
})

function refresh(userId, data) {
		console.log("-----START REFRESH-----");

		var data = JSON.parse(data);
		var user = data[userId];

		var currentTime = new Date();
		var lastUpdate = new Date(data[userId].lastUpdate);
		
		checkForTimer(user, lastUpdate, currentTime);
		user.lastUpdate = currentTime;

		console.log("-----END REFRESH-----");

	return data;
}

function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds*1000);
}

function makeActionTimer(userId, lastUpdate, seconds, action, item, itemQuantity, data, itemCost, craftingProficiency, errorList) {

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
		errorList.push("Existing Timer Error");
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
	timers[newTimerId].itemCost = itemCost;
	timers[newTimerId].craftingProficiency = craftingProficiency;

	timers[newTimerId].endTime = addSeconds(lastUpdate, seconds);

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
			if (timer.type === "craft") {
				user[timer.item].count += timer.itemQuantity;
				// TODO: Add max proficiency cap
				var proficiency = user[timer.item].proficiency;
				user[timer.item].qualities.push(proficiency);
				// TODO: Pull the 0.1 from items.json
				user[timer.item].proficiency = Number((proficiency + 0.1*(100-proficiency)).toFixed(2));
			} else {
				user[timer.item] += timer.itemQuantity;
			}
			newRefreshTime = timerEndTime;
			timers.count -= 1;
			// TODO: I will not be deleting the correct timer if I expand this behavior to multiple active timers
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
