function prepAjax() {
	$("#refresh").click(refresh);

	// $("#gather-food").click({newJob: "Gather Food"},changeJobAjax);

	// $("#gather-wood").click({newJob: "Gather Wood"},changeJobAjax);

	// $("#gather-stone").click({newJob: "Gather Stone"},changeJobAjax);

	$("#make-hatchet").click({tool: "Hatchet"},makeToolAjax);

	$("#make-pickaxe").click({tool: "Pickaxe"},makeToolAjax);

	$("#make-sickle").click({tool: "Sickle"},makeToolAjax);

	$("#explore").click(explore);	
}

function refresh() {
	$.ajax({
		url : 'http://127.0.0.1:8081/refresh',
		type : 'GET',
		data : {
			"currentUserId" : $("#currentUserId").val()
		},
		success : function(text) {
			// console.log(text);
			console.log("Refresh Successful");
			var data = JSON.parse(text);
			updateFoodCounter(data.food);
			updateWoodCounter(data.wood);
			updateStoneCounter(data.stone);
			$("#current-job").html(data.currentJob);
			$("#current-level").html(data.level);
			$(".population-counter").html(data.population);
			$("#number-of-hatchets").html(data.hatchets);
			$("#number-of-pickaxes").html(data.pickaxes);
			$("#number-of-sickles").html(data.sickles);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'refresh' AJAX request");
		}
	});
}

function changeJobAjax(newJob, element, callback, qtyElement, toolUsed, storageItem, collectedItem) {
	$.ajax({
		url : 'http://127.0.0.1:8081/changeJob',
		type : 'GET',
		data : {
			"currentUserId" : $("#currentUserId").val(),
			"newJob" : newJob,
			"toolUsed" : toolUsed,
			"storageItem" : storageItem,
			"collectedItem" : collectedItem
		},
		success : function(jsonResponse) {
			var jsonResponse = JSON.parse(jsonResponse);
			var time = jsonResponse.time;
			var amountCollected = jsonResponse.amountCollected;

			console.log("Success in changeJobAjax");
			$("#previous-job").html($("#current-job").html());
			$("#current-job").html(newJob);
			countdown(element, time, callback, qtyElement, amountCollected);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'changeJob: "+newJob+"' AJAX request");
		},
	});
}

function makeToolAjax(args) {
	var tool = args.data.tool;
	var currentWood = Number($("#wood-quantity").html());
	var currentStone = Number($("#stone-quantity").html());
	var previousJob = $("#current-job").html();
	if (currentWood >= 10 && currentStone >= 10 && (previousJob === "Gather Stone" || previousJob === "Gather Food" || previousJob === "Gather Wood")) {
		$.ajax({
			url : 'http://127.0.0.1:8081/makeTool',
			type : 'GET',
			data : {
				"currentUserId" : $("#currentUserId").val(),
				"tool" : tool
			},
			success : function(text) {
				if (text === "Already have a tool timer, not creating new one") {
					console.log(text);
				} else {
					var data = JSON.parse(text);
					updateWoodCounter(data.wood);
					updateStoneCounter(data.stone);
					// $("#current-job").html(data.currentJob);
					if (tool === "Hatchet") {
						$("#number-of-hatchets").html(data.hatchets);
					} else if (tool === "Pickaxe") {
						$("#number-of-pickaxes").html(data.pickaxes);
					} else if (tool === "Sickle") {
						$("#number-of-sickes").html(data.sickles);
					}
				}
			},
			error : function(jqXHR, textStatus, errorThrown) {
				console.log("There was an error with the 'makeTool' AJAX request");
			},
		});
	} else {
		console.log("Cannot make "+tool+" in ajax.js");
	}
}

function explore () {
	$.ajax({
		url : 'http://127.0.0.1:8081/explore',
		type : 'GET',
		success : function(text) {
			console.log(text);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'explore' AJAX request");
		},
	});

}