import { checkAuth, fetchData } from "./network.js";

const ctx = document.getElementById('myChart');

Chart.defaults.color = "#dee2e6"
// Chart.defaults.borderColor = "#dee2e6"
// Chart.defaults.backgroundColor = "#dee2e6"
checkAuth(() => {
	fetchData((rawdata) => {
		window.all_times = rawdata;
		window.current_session = "3x3";
		const label = [];
		const data = rawdata["3x3"].map(time => {
			if ()
				time["value"] / 1000
		});
		for (let i = 1; i <= data.length; i++) {
			label.push(i);
		}

		new Chart(ctx, {
			type: 'line',
			data: {
				labels: label,
				datasets: [{
					label: 'Single',
					data: data,
					borderWidth: 1,
					radius: 2
				}]
			},
			options: {
				// maintainAspectRatio: true,
				plugins: {
					title: {
						display: true,
						text: "hello"
					}
				},
				scales: {
					x: {
						title: {
							text: "Solve No.",
							display: true,
						}
					},
					y: {
						title: {
							text: "Time (s)",
							display: true,
						},
						beginAtZero: true
					}
				}
			}
		});
	})
})
