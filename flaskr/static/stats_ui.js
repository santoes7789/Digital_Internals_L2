import { getAoX } from "./stats.js";

Chart.defaults.color = "#dee2e6"

const ctx = document.getElementById('myChart');
const storedTimes = JSON.parse(localStorage.getItem('times'));
window.all_times = storedTimes;
window.current_session = "3x3";
let session_times = window.all_times[window.current_session];
updateSessions();


let label = [];
let data_single = [];
let data_ao5 = [];
let data_ao12 = [];

const chart = createChart();

window.addEventListener("load", () => {
	calculateStats();
	console.log("hello");
	updateChart();
});

function changeSession(session) {
	window.current_session = session;
	session_times = window.all_times[window.current_session];
	calculateStats()
	updateChart();
	updateSessions();
}

function calculateStats() {
	label = [];
	data_single = [];
	data_ao5 = [];
	data_ao12 = [];

	for (let i = 0; i < session_times.length; i++) {
		if (session_times[i]["modifiers"] == "dnf") {
			data_single.push(null);
		} else if (session_times[i]["modifiers"] == "+2") {
			data_single.push(session_times[i]["value"] / 1000 + 2);
		} else {
			data_single.push(session_times[i]["value"] / 1000);
		}

		const ao5 = getAoX(5, i);
		data_ao5.push(ao5 ? ao5 / 1000 : null);

		const ao12 = getAoX(12, i);
		data_ao12.push(ao12 ? ao12 / 1000 : null);
		label.push(i + 1);
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
		type: 'line',
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
			// maintainAspectRatio: true,
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
					beginAtZero: true
				}
			}
		}
	});

}


function updateSessions() {
	const sessionText = document.getElementById("session-text");
	const sessionText2 = document.getElementById("session-text2");
	const sessionDropdown = document.getElementById("session-dropdown");
	sessionText.textContent = window.current_session;
	sessionText2.textContent = window.current_session;
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
