chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "CAPTURE_RESPONSE") {
		const { requestBody, response } = message.data;
		const parsed = parseResponse(response);
		const answerKey = extractAnswerKey(response);

		chrome.storage.local.set({
			lastCapture: {
				request: requestBody,
				response: response,
				parsed: parsed,
				answerKey: answerKey,
				timestamp: Date.now(),
			},
		});
	}
});

function parseResponse(responseData) {
	if (!responseData?.data?.data?.questions) {
		return null;
	}

	const result = {
		listening: {},
		reading: {},
	};

	const questions = responseData.data.data.questions;

	questions.forEach((question) => {
		if (question.sub_questions && question.sub_questions.length > 0) {
			question.sub_questions.forEach((subQ) => {
				const questionNum = subQ.index;
				const type = question.type === "listening" ? "listening" : "reading";

				let userAnswer = "";
				let correctAnswer = "";
				let isCorrect = false;

				if (subQ.answer !== undefined && subQ.answer !== "") {
					if (typeof subQ.answer === "number") {
						userAnswer = String.fromCharCode(65 + subQ.answer);
					} else {
						userAnswer = subQ.answer;
					}
				}

				if (subQ.choices) {
					const correctChoice = subQ.choices.find(
						(c) => c.choice_right_answer === true
					);
					if (correctChoice) {
						correctAnswer = correctChoice.choice;
						isCorrect = userAnswer === correctChoice.choice;
					}
				}

				if (subQ.check_answer) {
					isCorrect = subQ.check_answer === "correct";
				}

				result[type][questionNum] = {
					answer: userAnswer,
					right_answer: correctAnswer,
					mark: isCorrect ? "right" : "wrong",
				};
			});
		}
	});

	return result;
}

function extractAnswerKey(responseData) {
	if (!responseData?.data?.data?.questions) {
		return null;
	}

	const answerKey = {
		listening: {},
		reading: {},
	};

	const questions = responseData.data.data.questions;

	questions.forEach((question) => {
		if (question.sub_questions && question.sub_questions.length > 0) {
			question.sub_questions.forEach((subQ) => {
				const questionNum = subQ.index;
				const type = question.type === "listening" ? "listening" : "reading";

				let correctAnswer = "";

				if (subQ.choices) {
					const correctChoice = subQ.choices.find(
						(c) => c.choice_right_answer === true
					);
					if (correctChoice) {
						correctAnswer = correctChoice.choice;
					}
				}

				if (correctAnswer) {
					answerKey[type][questionNum] = {
						right_answer: correctAnswer,
					};
				}
			});
		}
	});

	return answerKey;
}
