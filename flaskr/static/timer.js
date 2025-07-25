let all_times = {
	"3x3": [],
}
let current_session = "3x3";
let current_times = all_times[current_session];
let is_authenticated = false;

updateSessions();

fetch("/check-auth", {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
}).then(response => response.json())
	.then(data => {
		is_authenticated = data["authenticated"];
		if (is_authenticated) {
			console.log("User is authenticated");
			fetchData();
		}
	})

function fetchData() {
	fetch("/times", {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then(response => {
			if (response.status == 200) {
				return response.json();
			} else {
				return null;
			}
		}).then(data => {
			if (data) {
				Object.assign(all_times, data);
				current_times = all_times[current_session];
				updateChart();
				updateSessions();
				updateStats();
			}
		})
		.catch(error => {
			console.error("Error:", error);
		})

}


function addTime(time) {
	const newTime = { "timestamp": Date.now(), "value": time };
	current_times.push(newTime);

	newTime["session"] = current_session;

	if (is_authenticated) {
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
	updateStats()
	updateChart()
}

function deleteTime(time) {
	const index = current_times.indexOf(time);

	console.log(index);
	if (index == -1) return;

	current_times.splice(index, 1);
	if (is_authenticated) {
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
	updateStats()
	updateChart()
}



const timeModal = document.getElementById("time-info-modal");
const modalTitle = timeModal.querySelector(".modal-title");
const timeHeading = timeModal.querySelector(".time-heading");
const dateText = timeModal.querySelector(".date-text");
const timeText = timeModal.querySelector(".time-text");

const table = document.getElementById("time-table-body");

let current_time_selected;
const deleteTimeBtn = document.getElementById("delete-time-btn");
deleteTimeBtn.addEventListener("click", event => {
	deleteTime(current_time_selected);
})

document.getElementById("add-session-btn").addEventListener("click", event => {
	const sessionName = document.getElementById("add-session-input").value;
	document.getElementById("add-session-input").value = "";
	console.log("Creating session: ", sessionName);
	if (sessionName.trim()) {
		addSession(sessionName);
	}
})

function addSession(session_name) {
	all_times[session_name] = [];
	changeSession(session_name);
}

function changeSession(session) {
	current_session = session;
	current_times = all_times[current_session];
	updateSessions();
	updateStats();
	updateChart();

}

function updateSessions() {
	document.getElementById("session-text").textContent = current_session;
	const sessionDropdown = document.getElementById("session-dropdown");
	sessionDropdown.innerHTML = "";
	for (const key in all_times) {
		const newLi = document.createElement("li");
		const newP = document.createElement("p");
		newP.classList.add("dropdown-item");
		newP.textContent = key;
		newLi.appendChild(newP);
		sessionDropdown.appendChild(newLi);

		newLi.addEventListener("click", event => {
			changeSession(key);
		})
	}
}

function updateStats() {
	const best = getBest();
	const ao5 = getAoX(5);
	const ao12 = getAoX(12);

	const bestText = best ? millisecondsToTime(best) : "--";
	const ao5Text = ao5 ? millisecondsToTime(ao5) : "--";
	const ao12Text = ao12 ? millisecondsToTime(ao12) : "--";

	document.getElementById("best-text").textContent = bestText;
	document.getElementById("ao5-text").textContent = ao5Text;
	document.getElementById("ao12-text").textContent = ao12Text;


	table.innerHTML = "";
	table.insertRow(0); // for the line between header and other

	for (let i = 0; i < current_times.length; i++) {
		// Insert a new row at the end of the table (-1 or omitted index)
		const newRow = table.insertRow(0);

		const time = millisecondsToTime(current_times.at(i)["value"]);

		newRow.style.cursor = "pointer";
		newRow.setAttribute("data-bs-toggle", "modal");
		newRow.setAttribute("data-bs-target", "#time-info-modal");

		// Insert new cells into the new row
		const indexCell = newRow.insertCell(0); // Insert at index 0
		const timeCell = newRow.insertCell(1);

		indexCell.textContent = i + 1;
		timeCell.textContent = time;

		newRow.addEventListener("click", event => {
			console.log("hello");

			// Update the modal's content.
			current_time_selected = current_times.at(i);

			modalTitle.textContent = "Solve No. " + (i + 1);
			timeHeading.textContent = time;

			date = new Date(current_times.at(i)["timestamp"]);
			dateText.textContent = date.toDateString();
			timeText.textContent = date.toTimeString().split(' ')[0];
		})
	}
}



function getBest() {
	if (current_times.length == 0) return null;
	const timesOnlyArray = current_times.map(time => time["value"]);
	return Math.min(...timesOnlyArray);
}

function getAoX(x) {
	if (current_times.length < x) {
		return null;
	}
	const lastX = current_times.slice(-x).map(time => time["value"]);
	lastX.sort((a, b) => a - b);

	let sum = 0;
	for (let i = 1; i < (x - 1); i++) {
		sum += lastX[i];
	}
	return sum / (x - 2);
}


let startTime, updateInterval, timeoutId, timerState = "finished";
const waitTime = 500;

const timer = document.getElementById("timer");
const timerBackground = document.getElementById("timer-background");
const timerFading = document.getElementById("fading-bg");

document.addEventListener("keydown", function(event) {
	if (timerState == "finished") {
		if (event.code == "Space") {
			waitTimer();
		} else if (event.shiftKey && event.code == "Backspace") {
			deleteTime(current_times.at(-1));
		}
	} else if (timerState == "active") {
		stopTimer();
	}
});

document.addEventListener("keyup", function(event) {
	if (timerState == "waiting") {
		resetTimer();
	} else if (timerState == "ready" && event.code == "Space") {
		startTimer();

	} else if (timerState == "stopped") {
		resetTimer();
	}
});

function waitTimer() {
	timerState = "waiting"
	timer.classList.remove("text-danger", "text-success");
	timer.classList.add("text-danger");
	timeoutId = setTimeout(readyTimer, waitTime);
}

function readyTimer() {
	timerState = "ready";
	timer.classList.remove("text-danger", "text-success");
	timer.classList.add("text-success");
	timer.textContent = "0.000";
	timerBackground.style.zIndex = 10;
	timerFading.classList.add("show");

}

function startTimer() {
	timerState = "active";
	timer.classList.remove("text-danger", "text-success");

	startTime = Date.now();
	updateInterval = setInterval(updateTimer, 10);
}

function resetTimer() {
	timerState = "finished";
	timer.classList.remove("text-danger", "text-success");
	clearTimeout(timeoutId);
	clearInterval(updateInterval)
}

function stopTimer() {
	timerState = "stopped";
	const time = updateTimer() // Update final time
	timerFading.classList.remove("show");
	timerFading.addEventListener("webkitTransitionEnd", () => {
		timerBackground.style.zIndex = 0;
	}, { once: true })
	addTime(time);
	clearInterval(updateInterval)

}

function updateTimer() {
	const timeInMilliseconds = Date.now() - startTime;
	timer.textContent = millisecondsToTime(timeInMilliseconds);
	return timeInMilliseconds;
}


function millisecondsToTime(milli) {
	const milliseconds = Math.floor(milli % 1000);
	const seconds = Math.floor(milli / 1000) % 60;
	const minutes = Math.floor(milli / 1000 / 60) % 60;
	// const hours = Math.floor(milliseconds / 1000 / 60 / 60);

	let str = "";
	if (minutes) {
		str += String(minutes) + ":";
	}
	str += String(seconds) + "." + String(milliseconds).padStart(3, "0");
	return str;

}

// const ctx = document.getElementById('myChart');
//
//
// Chart.defaults.font.size = 10;
// const data = {
// 	labels: [],
// 	datasets: [{
// 		label: current_session,
// 		data: [],
// 	}]
// };
//
// const chart = new Chart(ctx, { type: "line", data: data });
//
function updateChart() {
	// const raw_data = current_times.map(time => time["value"] / 1000);
	// chart.data.datasets[0].data = raw_data;
	// chart.data.labels = [];
	// for (let i = 1; i <= raw_data.length; i++) {
	// 	chart.data.labels.push(i);
	// }
	//
	// chart.update();
	//
	// console.log(raw_data)
	//
}
