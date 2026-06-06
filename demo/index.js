import { yay } from "../src/yay.js";

document.getElementById("yay-form").addEventListener("submit", (e) => {
	e.preventDefault();
	yay(document.getElementById("yay-form-submit"), {
		count: 80,
		duration: 3500,
		width: 16,
		height: 16,
		spread: 300,
		mobileSpread: 50
	});
});