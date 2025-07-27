// SESSION ELEMENTS
const sessionText = document.getElementById("session-text");
const sessionDropdown = document.getElementById("session-dropdown");

let onClickSessionDropdown;
function setOnClickSessionDropdown(value) {
	onClickSessionDropdown = value
}

function updateSessions() {
	sessionText.textContent = window.current_session;
	sessionDropdown.innerHTML = "";
	for (const key in window.all_times) {
		const newLi = document.createElement("li");
		const newP = document.createElement("p");
		newP.classList.add("dropdown-item");
		newP.textContent = key;
		newLi.appendChild(newP);
		sessionDropdown.appendChild(newLi);
		newLi.addEventListener("click", event => {
			console.log(onClickSessionDropdown)
			onClickSessionDropdown(key);
		})
	}
}


// TIMER ELEMENT
const timer = document.getElementById("timer");
function updateTimer(startTime) {
	const timeInMilliseconds = Date.now() - startTime;
	timer.textContent = millisecondsToTime(timeInMilliseconds);
	return timeInMilliseconds;
}



// STATS ELEMENTS
const bestText = document.getElementById("best-text")
const ao5Text = document.getElementById("ao5-text")
const ao12Text = document.getElementById("ao12-text")
function updateStats(best, ao5, ao12) {
	const bestStr = best ? millisecondsToTime(best) : "--";
	const ao5Str = ao5 ? millisecondsToTime(ao5) : "--";
	const ao12Str = ao12 ? millisecondsToTime(ao12) : "--";

	bestText.textContent = bestStr;
	ao5Text.textContent = ao5Str;
	ao12Text.textContent = ao12Str;
}



// TABLE ELEMENTS
const table = document.getElementById("time-table-body");
let onClickTableRow;
function setOnClickTableRow(value) {
	onClickTableRow = value
}

function updateTable() {
	table.innerHTML = "";
	table.insertRow(0); // for the line between header and other

	const current_times = window.all_times[window.current_session];
	for (let i = 0; i < current_times.length; i++) {
		// Insert a new row at the end of the table (-1 or omitted index)
		const newRow = table.insertRow(0);

		const time = millisecondsToTime(current_times.at(i)["value"]);
		const mods = current_times.at(i)["modifiers"].split(",");

		newRow.style.cursor = "pointer";
		newRow.setAttribute("data-bs-toggle", "modal");
		newRow.setAttribute("data-bs-target", "#time-info-modal");

		// Insert new cells into the new row
		const indexCell = newRow.insertCell(0); // Insert at index 0
		const timeCell = newRow.insertCell(1);

		indexCell.textContent = i + 1;
		timeCell.textContent = time;
		if (mods.includes("dnf")) {
			timeCell.textContent = "DNF";
		}

		newRow.addEventListener("click", event => {
			onClickTableRow(i);
		})
	}
}



// Modal stuff
const timeModal = document.getElementById("time-info-modal");
const modalTitle = timeModal.querySelector(".modal-title");
const timeHeading = timeModal.querySelector(".time-heading");
const modifierText = timeModal.querySelector(".modifiers-text");
const timeText = timeModal.querySelector(".time-text");
const dateText = timeModal.querySelector(".date-text");

timeModal.addEventListener('shown.bs.modal', () => {
	const current_time_selected = window.current_times.at(window.current_time_index);

	modalTitle.textContent = "Solve No. " + (window.current_time_index + 1);
	timeHeading.textContent = current_time_selected["value"];

	const mods = current_time_selected["modifiers"].split(",");
	if (mods.includes("dnf")) {
		modifierText.textContent += "Did not finish";
	}
	if (mods.includes("+2")) {
		if (modifierText.textContent) {
			modifierText.textContent += ", ";
		}
		modifierText.textContent += "+2"
	}

	const date = new Date(current_time_selected["timestamp"]);
	dateText.textContent = date.toDateString();
	timeText.textContent = date.toTimeString().split(' ')[0];
})



function millisecondsToTime(milli) {
	const milliseconds = Math.floor(milli % 1000);
	const seconds = Math.floor(milli / 1000) % 60;
	const minutes = Math.floor(milli / 1000 / 60) % 60;
	const hours = Math.floor(milliseconds / 1000 / 60 / 60);

	let hoursStr = "";
	let minutesStr = "";
	let secondsStr = String(seconds) + ".";
	let milliStr = String(milliseconds).padStart(3, "0");
	if (minutes) {
		minutesStr = String(minutes) + ":";
		secondsStr = String(seconds).padStart(2, "0") + ".";
	}
	if (hours) {
		hoursStr = String(hours) + ":"
		minutesStr = String(minutes).padStart(2, "0") + ":";
	}

	return hoursStr + minutesStr + secondsStr + milliStr;

}

export {
	updateTable,
	updateStats,
	updateSessions,
	updateTimer,
	setOnClickSessionDropdown,
	setOnClickTableRow
}
