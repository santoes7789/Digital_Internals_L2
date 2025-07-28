import { checkAuth, fetchData } from "./network.js";
import { getAoX } from "./stats.js";

const ctx = document.getElementById('myChart');

Chart.defaults.color = "#dee2e6"
// Chart.defaults.backgroundColor = "#dee2e6"
checkAuth(() => {
	fetchData((rawdata) => {
		window.all_times = rawdata;
		window.current_session = "3x3";

		const session_times = window.all_times[window.current_session];


		const label = [];
		const data_single = [];
		const data_ao5 = [];
		const data_ao12 = [];
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

		new Chart(ctx, {
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
				// maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: window.current_session
					}
				},
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
	})
})
