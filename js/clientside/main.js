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


// Keep single character for now, in the future you can find other charatcets through exploration and control them similar to colonizing new planets in Ogame
// Focus on progression of technologies in metal similar to most games, stone, bronze, iron, etc.
// Take place in an mythical world, but keep to real world science as much as possible
// Progression of collected foods, not just searching for wheat, or "food" but actually take an approach such as foraging (berries), farm (various crops), hunting?
// Similarly, I could do something similar with wood and/or stone? Perhaps not those, but different qualities of iron, wrought iron, cast iron, mild and low carbon steel, higher-carbon steels.
// I'd like the game to be educational in how things are made
// Possibly a text based storyline, I don't want any graphical portions currently
// Possibly have a form of "research"? Would be on a separate timer as actionable things and you would "ponder" different technologies until you figure out certain aspects of them
// Require the player to "ponder" multiple different aspects of a technology to fully "unlock"/understand it.
// Move to VC
// Once the player creates an item, such as a certain quality forge, they keep that item permanantly. But in order to progress, they have to create lots of similar "stations".
// Require the player to sharpen tools at various times to maintain efficiency?
// Have items break irreparably sometimes?

