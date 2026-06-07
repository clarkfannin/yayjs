import { hooray } from "../src/hooray.js";

document.getElementById("hooray-form").addEventListener("submit", (e) => {
	e.preventDefault();
	hooray(document.getElementById("hooray-form-submit"), {
		count: 80,
		duration: 3500,
		width: 16,
		height: 8,
		spread: 300,
		mobileSpread: 50
	});
});