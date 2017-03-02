$(document).ready(function() {
	prepAjax();
	prepEvents();
});

function prepEvents() {
	$("#gather-berries").click({type: "gather", collectedItem: "berries", timer: "forageBerriesTimer", callback: postAction, qtyElement: "berries-quantity"}, changeJob);
	$("#gather-smallStones").click({type: "gather", collectedItem: "smallStones", timer: "gatherSmallStonesTimer", callback: postAction, qtyElement: "smallStones-quantity"}, changeJob);
	$("#gather-sticks").click({type: "gather", collectedItem: "sticks", timer: "gatherSticksTimer", callback: postAction, qtyElement: "sticks-quantity"}, changeJob);

	$("#craft-knockedStone").click({type: "craft", collectedItem: "knockedStones", timer: "craftKnockedStoneTimer", callback: postAction, qtyElement: "knockedStones-quantity"}, changeJob);
	$("#craft-stoneBowl").click({type: "craft", collectedItem: "stoneBowls", timer: "craftStoneBowlTimer", callback: postAction, qtyElement: "stoneBowls-quantity"}, changeJob);
}

function changeJob(args) {
	var jobType = args.data.type;
	var timer = args.data.timer;
	var callback = args.data.callback;
	var qtyElement = args.data.qtyElement;
	var collectedItem = args.data.collectedItem;
	var gatherStorageItem = $("#current-storage-item").html();
	var toolUsed = $("#current-gather-tool").html();
	changeJobAjax(jobType, '#'+timer, callback, qtyElement, toolUsed, gatherStorageItem, collectedItem);
}

function continuePreviousJob() {
	$("#current-job").html($("#previous-job").html());
	$("#previous-job").html("");
}

function postAction(qtyElement, qtyToIncrease) {
	var currentQty = Number($("#"+qtyElement).html());
	$("#"+qtyElement).html(currentQty+qtyToIncrease);
	continuePreviousJob();
}
