function prepAjax() {
	$("#refresh").click(refresh);

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
			console.log("Refresh Successful");
			var data = JSON.parse(text);
			$("#current-job").html(data.currentJob);
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
	var previousJob = $("#current-job").html();
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
			}
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'makeTool' AJAX request");
		},
	});
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