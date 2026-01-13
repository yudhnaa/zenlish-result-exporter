const originalFetch = window.fetch;
window.fetch = async function (...args) {
	const [url, options] = args;

	const response = await originalFetch.apply(this, args);

	if (url.includes("quizz-submitted") && options?.method === "POST") {
		const clonedResponse = response.clone();

		try {
			const responseData = await clonedResponse.json();
			const requestBody = options.body;

			window.postMessage(
				{
					type: "ZENLISH_CAPTURE",
					data: {
						requestBody: requestBody,
						response: responseData,
					},
				},
				"*"
			);
		} catch (error) {
			console.error("Error capturing response:", error);
		}
	}

	return response;
};

const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function () {
	const xhr = new originalXHR();
	const originalOpen = xhr.open;
	const originalSend = xhr.send;

	let method, url, requestBody;

	xhr.open = function (m, u, ...args) {
		method = m;
		url = u;
		return originalOpen.apply(this, [m, u, ...args]);
	};

	xhr.send = function (body) {
		requestBody = body;

		const originalOnLoad = xhr.onload;
		xhr.onload = function () {
			if (url.includes("quizz-submitted") && method === "POST") {
				try {
					const responseData = JSON.parse(xhr.responseText);

					window.postMessage(
						{
							type: "ZENLISH_CAPTURE",
							data: {
								requestBody: requestBody,
								response: responseData,
							},
						},
						"*"
					);
				} catch (error) {
					console.error("Error capturing XHR response:", error);
				}
			}

			if (originalOnLoad) {
				originalOnLoad.apply(this, arguments);
			}
		};

		return originalSend.apply(this, arguments);
	};

	return xhr;
};
