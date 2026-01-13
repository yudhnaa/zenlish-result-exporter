function calculateStats(parsed) {
	if (!parsed) {
		return { total: 0, answered: 0, correct: 0, wrong: 0 };
	}

	let total = 0;
	let answered = 0;
	let correct = 0;
	let wrong = 0;

	["listening", "reading"].forEach((section) => {
		if (parsed[section]) {
			Object.values(parsed[section]).forEach((question) => {
				total++;
				if (question.answer) {
					answered++;
					if (question.mark === "right") {
						correct++;
					} else {
						wrong++;
					}
				}
			});
		}
	});

	return { total, answered, correct, wrong };
}

function loadData() {
	chrome.storage.local.get(["lastCapture"], (result) => {
		if (result.lastCapture) {
			const { parsed, response, timestamp } = result.lastCapture;

			document.getElementById("status").textContent = `Last capture: ${new Date(
				timestamp
			).toLocaleString()}`;

			document.getElementById("content").style.display = "block";

			const stats = calculateStats(parsed);
			document.getElementById("totalQuestions").textContent = stats.total;
			document.getElementById("answeredQuestions").textContent = stats.answered;
			document.getElementById("correctAnswers").textContent = stats.correct;
			document.getElementById("wrongAnswers").textContent = stats.wrong;

			document.getElementById("downloadParsed").disabled = false;
			document.getElementById("downloadRaw").disabled = false;
			document.getElementById("downloadAnswerKey").disabled = false;
		} else {
			document.getElementById("status").textContent =
				"No data captured yet. Submit a test on zenlishtoeic.vn";
		}
	});
}

function downloadJSON(data, filename) {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

document.getElementById("downloadParsed").addEventListener("click", () => {
	chrome.storage.local.get(["lastCapture"], (result) => {
		if (result.lastCapture) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			downloadJSON(
				result.lastCapture.parsed,
				`zenlish-result-${timestamp}.json`
			);
		}
	});
});

document.getElementById("downloadRaw").addEventListener("click", () => {
	chrome.storage.local.get(["lastCapture"], (result) => {
		if (result.lastCapture) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			downloadJSON(
				result.lastCapture.response,
				`zenlish-raw-${timestamp}.json`
			);
		}
	});
});

document.getElementById("downloadAnswerKey").addEventListener("click", () => {
	chrome.storage.local.get(["lastCapture"], (result) => {
		if (result.lastCapture && result.lastCapture.answerKey) {
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			downloadJSON(
				result.lastCapture.answerKey,
				`zenlish-answer-key-${timestamp}.json`
			);
		}
	});
});

document.getElementById("clear").addEventListener("click", () => {
	chrome.storage.local.remove(["lastCapture", "lastRequest"], () => {
		document.getElementById("content").style.display = "none";
		document.getElementById("status").textContent =
			"Data cleared. Submit a test on zenlishtoeic.vn";
	});
});

loadData();
