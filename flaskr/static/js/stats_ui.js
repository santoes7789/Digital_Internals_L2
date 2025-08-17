import { getAoX } from "./stats.js";

Chart.defaults.color = "#dee2e6"

const ctx = document.getElementById('myChart');
const storedTimes = JSON.parse(localStorage.getItem('times'));
window.all_times = storedTimes;
window.current_session = sessionStorage.getItem("session");
let session_times = window.all_times[window.current_session];
updateSessions();

const sbt = document.getElementById("single-best-text");
const a5bt = document.getElementById("ao5-best-text");
const a12bt = document.getElementById("ao12-best-text");
const sct = document.getElementById("single-current-text");
const a5ct = document.getElementById("ao5-current-text");
const a12ct = document.getElementById("ao12-current-text");
const srt = document.getElementById("success-rate-text");
const ct = document.getElementById("consistency-text");
const tt = document.getElementById("times-table");

let label = [];
let data_single = [];
let data_ao5 = [];
let data_ao12 = [];

let best_single;
let best_ao5;
let best_ao12;

let current_single;
let current_ao5;
let current_ao12;
let success_rate;
let consistency;


const chart = createChart();

calculateStats();
updateStats();

window.addEventListener("load", () => {
	setTimeout(() => {
		updateChart();
	}, 500);
});

function changeSession(session) {
	window.current_session = session;
	session_times = window.all_times[window.current_session];
	calculateStats();
	updateStats();
	updateChart();
	updateSessions();
}

function calculateStats() {
	label = [];
	data_single = [];
	data_ao5 = [];
	data_ao12 = [];

	let count = 0;
	for (let i = 0; i < session_times.length; i++) {
		if (session_times[i]["modifiers"] == "dnf") {
			data_single.push(null);
		} else if (session_times[i]["modifiers"] == "+2") {
			data_single.push(session_times[i]["value"] / 1000 + 2);
			count++;
		} else {
			data_single.push(session_times[i]["value"] / 1000);
			count++;
		}

		const ao5 = getAoX(5, i);

		data_ao5.push(ao5 ? ao5 / 1000 : null);

		const ao12 = getAoX(12, i);
		data_ao12.push(ao12 ? ao12 / 1000 : null);

		label.push(i + 1);
	}

	best_single = Math.min(...data_single);
	best_ao5 = Math.min(...data_ao5.filter(x => x != null));
	best_ao12 = Math.min(...data_ao12.filter(x => x != null));

    current_single = data_single[data_single.length - 1];
    current_ao5 = formatMilliseconds( getAoX(5));
    current_ao12 = formatMilliseconds(getAoX(12));

	success_rate = count / session_times.length * 100;

	// Mean (average)
	const mean = data_single.reduce((a, b) => a + b, 0) / data_single.length;
	// Calculate variance
	const variance = data_single.reduce((sum, t) => sum + (t - mean) ** 2, 0) / data_single.length;
	// Standard deviation
	const stdDev = Math.sqrt(variance);
	// Consistency = stdDev / mean
	consistency = stdDev / mean;
}

function updateStats() {
	sbt.textContent = best_single.toFixed(3);
	a5bt.textContent = best_ao5.toFixed(3);
	a12bt.textContent = best_ao12.toFixed(3);
	srt.textContent = success_rate.toFixed(2) + "%";
	ct.textContent = consistency.toFixed(2);

    sct.textContent = current_single ? current_single: "--";
    a5ct.textContent = current_ao5 ? current_ao5: "--";
    a12ct.textContent = current_ao12 ? current_ao12: "--";


	tt.innerHTML = "";
	for (let i = session_times.length - 1; i >= 0; i--) {
		const time = document.createElement("div");
		time.style.cursor = "pointer";
		time.classList.add("time-entry");
		time.textContent = timeToString(session_times[i]);
		tt.appendChild(time);
	}
}

function updateChart() {
	chart.data.labels = label;
	chart.data.datasets[0].data = data_single;
	chart.data.datasets[1].data = data_ao5;
	chart.data.datasets[2].data = data_ao12;
	chart.update();
}

function createChart() {
	return new Chart(ctx, {
		type: "line",
		data: {
			labels: label,
			datasets: [
				{
					label: 'Single',
					data: data_single,
					borderWidth: 1,
					radius: 2,
					// borderColor: "#00ff00"
				},
				{
					label: 'Average of 5',
					data: data_ao5,
					borderWidth: 1,
					radius: 1
				},
				{
					label: 'Average of 12',
					data: data_ao12,
					borderWidth: 1,
					radius: 1
				},

			]
		},
		options: {
			// animation: false,
			responsive: true,
			maintainAspectRatio: true,
			scales: {
				x: {
					title: {
						text: "Solve No.",
						display: true,
					},
					grid: {
						color: "#dee2e609"
					}
				},
				y: {
					title: {
						text: "Time (s)",
						display: true,
					},
					grid: {
						color: "#dee2e6bf"
					},
					// beginAtZero: true
				}
			}
		}
	});

}


function updateSessions() {
	const sessionText = document.getElementById("session-text");
	const sessionDropdown = document.getElementById("session-dropdown");
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
			changeSession(key);
		})
	}
}

function timeToString(time) {
	let milliseconds = time["value"];

	if (time["modifiers"] == "+2") {
		milliseconds += 2000;
		return formatMilliseconds(milliseconds) + "+";
	} else {
		return formatMilliseconds(milliseconds);
	}
}

function formatMilliseconds(milli) {
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
