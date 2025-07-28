import { checkAuth, fetchData } from "./network.js";

const ctx = document.getElementById('myChart');


// Chart.defaults.font.size = 10;
// const data = {
// 	labels: [],
// 	datasets: [{
// 		label: window.current_session,
// 		data: [],
// 	}]
// };

checkAuth(() => {
	fetchData((rawdata) => {
		const label = [];
		const data = rawdata["3x3"].map(time => time["value"] / 1000);
		for (let i = 1; i <= data.length; i++) {
			label.push(i);
		}


		new Chart(ctx, {
			type: 'line',
			data: {
				labels: label,
				datasets: [{
					label: '3x3',
					data: data,
					// borderWidth: 1
				}]
			},
			options: {
				maintainAspectRatio: true,
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	})
})
function updateChart() {
	const raw_data = window.current_times.map(time => time["value"] / 1000);
	chart.data.datasets[0].data = raw_data;
	chart.data.labels = [];
	for (let i = 1; i <= raw_data.length; i++) {
		chart.data.labels.push(i);
	}

	chart.update();

	console.log(raw_data)

}
