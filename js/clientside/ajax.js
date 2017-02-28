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
			$("#current-storage-item").html(data.currentStorageItem);
			$("#current-gather-tool").html(data.currentGatherTool);
			$("#berries-quantity").html(data.berries);
			$("#smallStones-quantity").html(data.smallStones);
			$("#sticks-quantity").html(data.sticks);
			$("#knockedStones-quantity").html(data.knockedStones);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'refresh' AJAX request");
		}
	});
}

function changeJobAjax(jobType, element, callback, qtyElement, toolUsed, storageItem, collectedItem) {
	var jobText = jobType.concat(" ").concat(collectedItem);

	$.ajax({
		url : 'http://127.0.0.1:8081/changeJob',
		type : 'GET',
		data : {
			"currentUserId" : $("#currentUserId").val(),
			"jobType" : jobType,
			"toolUsed" : toolUsed,
			"storageItem" : storageItem,
			"collectedItem" : collectedItem
		},
		success : function(response) {
			console.log("response: "+response);
			if (response === "Existing Timer Error") {
				console.log("Failure in changeJobAjax: " + response);
				return;
			}
			var jsonResponse = JSON.parse(response);
			var time = jsonResponse.time;
			var amountCollected = jsonResponse.amountCollected;

			console.log("Success in changeJobAjax");
			$("#previous-job").html($("#current-job").html());
			$("#current-job").html(jobText);
			countdown(element, time, callback, qtyElement, amountCollected);
		},
		error : function(jqXHR, textStatus, errorThrown) {
			console.log("There was an error with the 'changeJob: "+jobText+"' AJAX request");
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