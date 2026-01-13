window.addEventListener("message", (event) => {
	if (event.source !== window) return;

	if (event.data.type === "ZENLISH_CAPTURE") {
		chrome.runtime.sendMessage({
			type: "CAPTURE_RESPONSE",
			data: event.data.data,
		});
	}
});
