var actionTimer;

$(document).ready(function() {
	prepAjax();
	prepEvents();
});

function prepEvents() {
	$("#level-up").click(function() {
		var currentLevel = Number($("#current-level").html());
		$("#current-level").html(currentLevel+1);
	});

	$("#make-hatchet").click({tool: "Hatchet"},makeTool);
	$("#make-pickaxe").click({tool: "Pickaxe"},makeTool);
	$("#make-sickle").click({tool: "Sickle"},makeTool);
	$("#gather-food").click({newJob: "Gather Food", timer: "gatherFoodTimer", callback: postGather, qtyElement: "food-quantity"},changeJob);
	$("#gather-wood").click({newJob: "Gather Wood", timer: "gatherWoodTimer", callback: postGather, qtyElement: "wood-quantity"},changeJob);
	$("#gather-stone").click({newJob: "Gather Stone", timer: "gatherStoneTimer", callback: postGather, qtyElement: "stone-quantity"},changeJob);
	// TODO: Add use of storage and tool
	// TODO: Get storage time, and tool efficiency from items.json
	$("#gather-berries").click({newJob: "Gather Berries", collectedItem: "berries", timer: "forageBerriesTimer", callback: postGather, qtyElement: "berries-quantity"}, changeJob);
	$("#gather-smallStones").click({newJob: "Gather Small Stones", collectedItem: "smallStones", timer: "gatherSmallStonesTimer", callback: postGather, qtyElement: "smallStones-quantity"}, changeJob);
	$("#gather-sticks-scavenge").click({newJob: "Gather Sticks", collectedItem: "sticks", timer: "gatherSticksTimer", callback: postGather, qtyElement: "sticks-quantity"}, changeJob);
}

function changeJob(args) {
	var newJob = args.data.newJob;
	var timer = args.data.timer;
	var callback = args.data.callback;
	var qtyElement = args.data.qtyElement;
	var collectedItem = args.data.collectedItem;
	var storageItem = $("#current-storage-item").html();
	var toolUsed = $("#current-gather-tool").html();
	changeJobAjax(newJob, '#'+timer, callback, qtyElement, toolUsed, storageItem, collectedItem);
}

function makeTool(args) {
	var tool = args.data.tool;
	var currentWood = Number($("#wood-quantity").html());
	var currentStone = Number($("#stone-quantity").html());
	var previousJob = $("#current-job").html();
	if (currentWood >= 10 && currentStone >= 10 && (previousJob === "Gather Stone" || previousJob === "Gather Food" || previousJob === "Gather Wood")) {
		$("#wood-quantity").html(currentWood -= 10);
		$("#stone-quantity").html(currentStone -= 10);
		$("#previous-job").html(previousJob);
		$("#current-job").html("Making "+tool);
		countdown('#make'+tool+'Timer', 10, makeToolTimer, tool);
	} else {
		console.log("Error, cannot make tool in main.js onclick");
	}
}

function makeToolTimer(tool) {
	if (tool === "Hatchet") {
		var currentHatchets = Number($("#number-of-hatchets").html());
		$("#number-of-hatchets").html(currentHatchets+1);
	} else if (tool === "Pickaxe") {
		var currentPickaxes = Number($("#number-of-pickaxes").html());
		$("#number-of-pickaxes").html(currentPickaxes+1);
	} else if (tool === "Sickle") {
		var currentSickles = Number($("#number-of-sickles").html());
		$("#number-of-sickles").html(currentSickles+1);
	}

	continuePreviousJob();
}

function continuePreviousJob() {
	$("#current-job").html($("#previous-job").html());
	$("#previous-job").html("");
}

function postGather(qtyElement, qtyToIncrease) {
	var currentQty = Number($("#"+qtyElement).html());
	$("#"+qtyElement).html(currentQty+qtyToIncrease);
	continuePreviousJob();
}
