import * as ui from "./ui.js"
import { checkAuth, fetchData, postDeleteTime, postNewTime } from "./network.js";

window.all_times = { "3x3": [] }
window.current_session = "3x3";
window.current_time_index;
window.is_authenticated = false;


// CHECK IF USER IS AUTHENTICATED
checkAuth((is_authenticated) => {
	window.is_authenticated = is_authenticated;
	fetchData((data) => {
		Object.assign(window.all_times, data);
		ui.updateStats(getBest(), getAoX(5), getAoX(12));
		ui.updateTable();
		ui.updateSessions();
	})
})



function addTime(time) {
	const newTime = { "timestamp": Date.now(), "value": time, "modifiers": "" };
	window.all_times[window.current_session].push(newTime);
	newTime["session"] = window.current_session;
	postNewTime(newTime);

	ui.updateTable();
	ui.updateStats(getBest(), getAoX(5), getAoX(12));
}

function deleteTime(time) {
	const current_times = window.all_times[window.current_session];
	const index = current_times.indexOf(time);
	if (index == -1) return;
	current_times.splice(index, 1);
	postDeleteTime(time);

	ui.updateTable();
	ui.updateStats(getBest(), getAoX(5), getAoX(12));
}

function addModifier(time, modifier) {
	const current_times = window.all_times[window.current_session];

	let mods = time["modifiers"];
	mods = mods ? mods.split(",") : [];

	if (!mods.includes(modifier)) {
		mods.push(modifier);
	}

	mods.sort();
	for (let _time of current_times) {
		if (_time.timestamp === time.timestamp) {
			_time.modifiers = mods.join();
		}
	}

	// updateStats();
}

function addSession(session_name) {
	window.all_times[session_name] = [];
	changeSession(session_name);
}

function changeSession(session) {
	window.current_session = session;

	console.log("erm hello?")
	ui.updateStats(getBest(), getAoX(5), getAoX(12));
	ui.updateTable();
	ui.updateSessions();

}

// SETTING UP BUTTONS
const timeModal = document.getElementById("time-info-modal");
const deleteTimeBtn = document.getElementById("delete-time-btn");
deleteTimeBtn.addEventListener("click", event => {
	deleteTime(current_time_selected);
})

const plusTwoBtn = timeModal.querySelector(".plus-2");
plusTwoBtn.addEventListener("click", event => {
	addModifier(current_time_selected, "+2");
})

const dnfBtn = timeModal.querySelector(".dnf");
dnfBtn.addEventListener("click", event => {
	addModifier(current_time_selected, "dnf");
})

const addSessionBtn = document.getElementById("add-session-btn");
addSessionBtn.addEventListener("click", event => {
	const sessionName = document.getElementById("add-session-input").value;
	document.getElementById("add-session-input").value = "";
	if (sessionName.trim()) {
		console.log("Creating session: ", sessionName);
		addSession(sessionName);
	}
})

ui.setOnClickSessionDropdown((key) => {
	changeSession(key);
})

ui.setOnClickTableRow((index) => {
	window.current_time_index = index;
})

function getBest() {
	const current_times = window.all_times[window.current_session];
	if (current_times.length == 0) return null;
	const timesOnlyArray = current_times.map(time => time["value"]);
	return Math.min(...timesOnlyArray);
}

function getAoX(x) {
	const current_times = window.all_times[window.current_session];
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


// ALL TIMER RELATED STUFF
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
			deleteTime(window.all_times[window.current_session].at(-1));
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
	updateInterval = setInterval(() => ui.updateTimer(startTime), 10);
}

function resetTimer() {
	timerState = "finished";
	timer.classList.remove("text-danger", "text-success");
	clearTimeout(timeoutId);
	clearInterval(updateInterval)
}

function stopTimer() {
	timerState = "stopped";
	const time = ui.updateTimer(startTime) // Update final time
	timerFading.classList.remove("show");
	timerFading.addEventListener("webkitTransitionEnd", () => {
		timerBackground.style.zIndex = 0;
	}, { once: true })
	addTime(time);
	clearInterval(updateInterval)

}

// const ctx = document.getElementById('myChart');
//
//
// Chart.defaults.font.size = 10;
// const data = {
// 	labels: [],
// 	datasets: [{
// 		label: window.current_session,
// 		data: [],
// 	}]
// };
//
// const chart = new Chart(ctx, { type: "line", data: data });
//
// function updateChart() {
// const raw_data = window.current_times.map(time => time["value"] / 1000);
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
// }
