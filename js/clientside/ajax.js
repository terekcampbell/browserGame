function prepAjax() {
	$("#refresh").click(refresh);

	$("#gather-food").click({newJob: "Gather Food"},changeJob);

	$("#gather-wood").click({newJob: "Gather Wood"},changeJob);

	$("#gather-stone").click({newJob: "Gather Stone"},changeJob);

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

function changeJob(event) {
	$.ajax({
		url : 'http://127.0.0.1:8081/changeJob',
		type : 'GET',
		data : {
			"currentUserId" : $("#currentUserId").val(),
			"newJob" : event.data.newJob
		},
		success : function(text) {
			console.log(text);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'changeJob: "+event.data.newJob+"' AJAX request");
		},
	});
}

function makeToolAjax(args) {
	var tool = args.data.tool;
	var currentWood = Number($(".wood-counter").html());
	var currentStone = Number($(".stone-counter").html());
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