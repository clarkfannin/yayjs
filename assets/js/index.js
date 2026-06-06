import { yay } from "./yay.js";

document.getElementById("yay-form").addEventListener("submit", (e) => {
	e.preventDefault();
	yay(document.getElementById("yay-form-submit"), {
		count: 200,
		duration: 2500,
		width: 16,
		height: 16,
		spread: 300,
        color: "goldenrod",
		image: "star.svg",
	});
});