var actionTimer;

$(document).ready(function() {
    setInterval(updateCounters, 1000);
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
	$("#gather-food").click({newJob: "Gather Food"},changeJob);
	$("#gather-wood").click({newJob: "Gather Wood"},changeJob);
	$("#gather-stone").click({newJob: "Gather Stone"},changeJob);
	// TODO: Add use of storage and tool
	// TODO: Get storage time, and tool efficiency from items.json
	$("#gather-berries").click({newJob: "Gather Berries", timer: "forageBerriesTimer", timeInSeconds: 2, qtyToIncrease: 10, callback: postGather, qtyElement: "berries-quantity"}, changeJob);
	$("#gather-smallStones").click({newJob: "Gather Small Stones", timer: "gatherSmallStonesTimer", timeInSeconds: 2, qtyToIncrease: 2, callback: postGather, qtyElement: "smallStones-quantity"}, changeJob);
	$("#gather-sticks-scavenge").click({newJob: "Gather Sticks", timer: "gatherSticksTimer", timeInSeconds: 3, qtyToIncrease: 3, callback: postGather, qtyElement: "sticks-quantity"}, changeJob);
	$("#gather-sticks-cut").click({newJob: "Gather Sticks", timer: "gatherSticksTimer", timeInSeconds: 1, qtyToIncrease: 5, callback: postGather, qtyElement: "sticks-quantity"}, changeJob);
}

function changeJob(args) {
	var newJob = args.data.newJob;
	var timer = args.data.timer;
	var time = args.data.timeInSeconds;
	var callback = args.data.callback;
	var qtyElement = args.data.qtyElement;
	var qtyToIncrease = args.data.qtyToIncrease;
	var storageItem = $("#current-storage-item").html();
	var toolUsed = $("#current-gather-tool").html();
	$("#previous-job").html($("#current-job").html());
	$("#current-job").html(newJob);
	countdown('#'+timer, 0, time, callback, qtyElement, qtyToIncrease);
}

function makeTool(args) {
	var tool = args.data.tool;
	var currentWood = Number($(".wood-counter").html());
	var currentStone = Number($(".stone-counter").html());
	var previousJob = $("#current-job").html();
	if (currentWood >= 10 && currentStone >= 10 && (previousJob === "Gather Stone" || previousJob === "Gather Food" || previousJob === "Gather Wood")) {
		$(".wood-counter").html(currentWood -= 10);
		$(".stone-counter").html(currentStone -= 10);
		$("#previous-job").html(previousJob);
		$("#current-job").html("Making "+tool);
		countdown('#make'+tool+'Timer', 0, 10, makeToolTimer, tool);
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
