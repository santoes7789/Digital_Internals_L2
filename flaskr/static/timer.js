import * as ui from "./timer_ui.js"
import { checkAuth, fetchData, postDeleteTime, postNewTime, putNewTime } from "./network.js";

window.all_times = { "3x3": [] }
window.current_session = "3x3";
window.current_time_index;


// CHECK IF USER IS AUTHENTICATED
checkAuth(() => {
	fetchData((data) => {
		Object.assign(window.all_times, data);
		ui.updateStats();
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
	ui.updateStats();
}

function deleteTime(index) {
	const current_times = window.all_times[window.current_session];
	const time = current_times.at(index);
	if (index == -1) return;
	current_times.splice(index, 1);
	postDeleteTime(time);

	ui.updateTable();
	ui.updateStats();
}

function addModifier(time_index, modifier, toggle = false) {
	const current_times = window.all_times[window.current_session];

	const mod = current_times.at(time_index)["modifiers"];

	if (mod != modifier) {
		current_times.at(time_index).modifiers = modifier;
	} else if (toggle) {
		current_times.at(time_index).modifiers = "";
	}

	putNewTime(current_times.at(time_index));

	ui.updateTable();
	ui.updateModal();
}

function addSession(session_name) {
	window.all_times[session_name] = [];
	changeSession(session_name);
}

function changeSession(session) {
	window.current_session = session;

	console.log("erm hello?")
	ui.updateStats();
	ui.updateTable();
	ui.updateSessions();

}

// SETTING UP BUTTONS
const timeModal = document.getElementById("time-info-modal");
const deleteTimeBtn = document.getElementById("delete-time-btn");
deleteTimeBtn.addEventListener("click", event => {
	deleteTime(window.current_time_index);
})

const plusTwoBtn = timeModal.querySelector(".plus-2");
plusTwoBtn.addEventListener("click", event => {
	addModifier(window.current_time_index, "+2", true);
})

const dnfBtn = timeModal.querySelector(".dnf");
dnfBtn.addEventListener("click", event => {
	addModifier(window.current_time_index, "dnf", true);
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
	ui.updateModal();
})

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
			deleteTime(window.all_times[window.current_session].length - 1);
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
	timer.innerHTML = '0<span class="text-primary">.</span>000';
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

