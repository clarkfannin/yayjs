class Yay {
	static #isPainting = false;

	#pieces;
	#target;
	#options;

	constructor(target, options = {}) {
		this.#pieces = [];

		this.#target = target;

		this.#options = {
			count: 100,
			width: target.clientWidth / 4,
			height: (target.clientWidth / 4) * 0.6,
			duration: 3000,
			spread: 200,
			mobileSpread: 50,
			...options,
		};

		if (this.#options.count > 2500) {
			console.warn(
				`yay: count capped at 2500 (requested ${this.options.count})`,
			);
			this.options.count = 2500;
		}

		this.warn = () => {
			if (this.#options.count > 1000)
				console.warn(
					"yay: a high count > 1000 is likely to impact performance",
				);
		};
		this.warn();
	}

	paint() {
		if (Yay.#isPainting) return;
		Yay.#isPainting = true;
		for (let i = 0; i < this.#options.count; i++) {
			const el = document.createElement("span");
			el.classList.add("yay-piece");

			if (this.#options.image) {
				// one value up front to retain image proportions
				const rand = Math.random();
				el.style.width = `${rand * this.#options.width}px`;
				el.style.height = `${rand * this.#options.height}px`;

				if (this.#options.color) {
					el.style.backgroundColor = this.#options.color;
					el.style.maskImage = `url(${this.#options.image})`;
				} else {
					el.style.backgroundImage = `url(${this.#options.image})`;
				}
			} else {
				// randomize size if generating CSS confetti
				el.style.width = `${Math.random() * this.#options.width}px`;
				el.style.height = `${Math.random() * this.#options.height}px`;

				// randomize color if generating CSS confetti
				el.style.background = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
			}

			const rect = this.#target.getBoundingClientRect();
			el.style.left = `${rect.left + rect.width / 2}px`;
			el.style.top = `${rect.top + rect.height / 2}px`;

			const angle = Math.random() * Math.PI * 2;
			const viewportWidth = window.innerWidth;
			let distance;
			if (viewportWidth < 800) {
				distance = 80 + Math.random() * this.#options.mobileSpread;
			} else {
				distance = 80 + Math.random() * this.#options.spread;
			}
			el.style.setProperty(
				`--burst-x`,
				`${Math.random() * Math.cos(angle) * distance}px`,
			);
			el.style.setProperty(
				`--burst-y`,
				`${Math.random() * Math.sin(angle) * distance}px`,
			);

			el.style.setProperty(`--fall-x`, `0px`);
			el.style.setProperty(`--rot`, `${Math.floor(Math.random() * 365)}deg`);

			el.style.setProperty(
				`--duration`,
				`${(this.#options.duration / 1000).toFixed(2)}s`,
			);
			el.style.animationDelay = `${Math.random() * 0.1}s`;

			this.#pieces.push(el);
			document.body.append(el);
		}

		setTimeout(() => {
			Yay.#isPainting = false;
			this.cleanup();
		}, this.#options.duration);
	}

	cleanup() {
		this.#pieces.forEach((piece) => {
			piece.remove();
		});
	}
}

export const yay = (target, options = {}) => {
	const y = new Yay(target, options);
	y.paint();
};

document.querySelectorAll(".yay-target").forEach((el) => {
	el.addEventListener("click", (e) => {
		yay(e.target, {
			count: 1000,
			duration: 2500,
			width: 10,
			height: 10,
			spread: 100,
		});
	});
});

/*
options: {
    count: 200, // number of pieces; density
    width: target.clientWidth / 10, // width in px
    height: (target.clientWidth / 10) * 0.6, // height in px
    duration: 3000, // duration of the animation from start to finish
}
*/
