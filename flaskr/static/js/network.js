async function checkAuth() {
	const response = await fetch("/check-auth", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
	const data = await response.json();
	return data["authenticated"];
}

async function fetchData() {
	if (!window.is_authenticated) return;
	const response = await fetch("/times", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
	const data = await response.json()
	return data;
}

function postNewTime(newTime) {
	if (!window.is_authenticated) return;
	fetch("/times", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newTime)
	})
		.then(response => {
			if (response.status == 204) {
				console.log("Sucessfully sent new time to server")
			} else {
				console.log("Failed to send new time to server")
			}
		}).catch(error => {
			console.error("Error:", error);
		})
}

function postDeleteTime(time) {
	if (!window.is_authenticated) return;

	fetch("/times", {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(time)
	})
		.then(response => {
			if (response.status == 204) {
				console.log("Sucessfully deleted time on server");
			} else {
				console.log("Failed to delete time on server");
			}
		}).catch(error => {
			console.error("Error:", error);
		})
}

function putNewTime(time) {
	fetch("/times", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(time)
	})
		.then(response => {
			if (response.status == 204) {
				console.log("Sucessfully changed time entry on server");
			} else {
				console.log("Failed to change time entry on server");
			}
		}).catch(error => {
			console.error("Error:", error);
		})
}

export { checkAuth, fetchData, postNewTime, postDeleteTime, putNewTime };
