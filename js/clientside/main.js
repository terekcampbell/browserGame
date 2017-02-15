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
	
	changeJobSetup();
}

function changeJobSetup() {
	$("#gather-food").click(function() {
		$("#current-job").html("Gather Food");
	});
	$("#gather-wood").click(function() {
		$("#current-job").html("Gather Wood");
	});
	$("#gather-stone").click(function() {
		$("#current-job").html("Gather Stone");
	});
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

	$("#current-job").html($("#previous-job").html());
	$("#previous-job").html("");
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
