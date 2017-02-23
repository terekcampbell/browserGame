function updateCounters() {
	var currentJob = $("#current-job").html();
	if (currentJob === "Gather Food") {
		updateFoodCounter(null);
	}
	if (currentJob === "Gather Wood") {
		updateWoodCounter(null);
	}
	if (currentJob === "Gather Stone") {
		updateStoneCounter(null);
	}
}

function updateFoodCounter(updatedFood) {
	if (updatedFood == null) {
		var currentCount = Number($("#food-quantity").html());
		var currentLevel = Number($("#current-level").html());
		var currentSickles = Number($("#number-of-sickles").html());
		var currentPopulation = Number($(".population-counter").html());
		var updatedCount = currentCount += currentLevel * currentPopulation + Math.min(currentSickles, currentPopulation);
		$("#food-quantity").html(updatedCount);
	} else {
		// console.log("updatedFood: "+updatedFood);
		$("#food-quantity").html(Math.floor(updatedFood));
	}
}

function updateWoodCounter(updatedWood) {
	if (updatedWood == null) {
		var currentCount = Number($("#wood-quantity").html());
		var currentLevel = Number($("#current-level").html());
		var currentHatchets = Number($("#number-of-hatchets").html());
		var currentPopulation = Number($(".population-counter").html());
		var updatedCount = currentCount += currentLevel * currentPopulation + Math.min(currentHatchets, currentPopulation);
		$("#wood-quantity").html(updatedCount);
	} else {
		// console.log("updatedWood: "+updatedWood);
		$("#wood-quantity").html(Math.floor(updatedWood));
	}
}

function updateStoneCounter(updatedStone) {
	if (updatedStone == null) {
		var currentCount = Number($("#stone-quantity").html());
		var currentLevel = Number($("#current-level").html());
		var currentPickaxes = Number($("#number-of-pickaxes").html());
		var currentPopulation = Number($(".population-counter").html());
		var updatedCount = currentCount += currentLevel * currentPopulation + Math.min(currentPickaxes, currentPopulation);
		$("#stone-quantity").html(updatedCount);
	} else {
		// console.log("updatedStone: "+updatedStone);
		$("#stone-quantity").html(Math.floor(updatedStone));
	}

}
