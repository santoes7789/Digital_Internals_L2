function getBest() {
	const current_times = window.all_times[window.current_session];
	if (current_times.length == 0) return null;
	const timesOnlyArray = current_times.map(time => time["value"]);
	return Math.min(...timesOnlyArray);
}

function getAoX(x, index) {
	const current_times = window.all_times[window.current_session];
	if (index == undefined) {
		index = current_times.length - 1;
	}
	if (current_times.length < x || index - x + 1 < 0) {
		return null;
	}
	let times;
	times = current_times.slice(index - x + 1, index + 1).map((time) => {
		const mod = (time["modifiers"] == "+2") ? 2000 : 0;
		return time["value"] + mod;
	});
	times.sort((a, b) => a - b);

	let sum = 0;
	for (let i = 1; i < (x - 1); i++) {
		sum += times[i];
	}
	return sum / (x - 2);
}

export { getAoX, getBest }
