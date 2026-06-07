class Hooray {
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

		this.#warn();
	}

	#warn() {
		if (this.#options.count > 2500) {
			console.warn(
				`[hooray.js]:\nwarning: count capped at 2500. a high count is likely to impact performance.`,
			);
			this.#options.count = 2500;
		} else if (this.#options.count > 1000)
			console.warn(
				"[hooray.js]:\nwarning: a high count is likely to impact performance.",
			);
	}

	paint() {
		if (Hooray.#isPainting) return;
		Hooray.#isPainting = true;
		const frag = new DocumentFragment();

		const spread =
			window.innerWidth < 800
				? this.#options.mobileSpread
				: this.#options.spread;

		for (let i = 0; i < this.#options.count; i++) {
			const piece = new Piece(this.#target, this.#options, spread);
			this.#pieces.push(piece);
			frag.append(piece.el);
		}
		document.body.append(frag);

		setTimeout(() => {
			Hooray.#isPainting = false;
			this.#cleanup();
		}, this.#options.duration);
	}

	#cleanup() {
		this.#pieces.forEach((piece) => {
			piece.el.remove();
		});
	}
}

class Piece {
	#el;
	#options;
	#target;
	#spread;
	constructor(target, options, spread) {
		this.#options = options;
		this.#target = target;
		this.#spread = spread;
		this.#el = document.createElement("span");
		this.#el.classList.add("hooray-piece");
		this.#applySize();
		this.#applyStyles();
		this.#applyPosition();
		this.#applyTrajectory();
	}

	get el() {
		return this.#el;
	}

	#applySize() {
		const wRand = Math.random();
		const hRand = this.#options.image ? wRand : Math.random();
		this.#el.style.width = `${wRand * this.#options.width}px`;
		this.#el.style.height = `${hRand * this.#options.height}px`;
	}

	#applyStyles() {
		if (!this.#options.image) {
			this.#el.style.backgroundColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
			return;
		}

		if (this.#options.color) {
			this.#el.style.backgroundColor = this.#options.color;
			this.#el.style.maskImage = `url(${this.#options.image})`;
		} else {
			this.#el.style.backgroundImage = `url(${this.#options.image})`;
		}
	}

	#applyPosition() {
		const rect = this.#target.getBoundingClientRect();
		this.#el.style.left = `${rect.left + rect.width / 2}px`;
		this.#el.style.top = `${rect.top + rect.height / 2}px`;
	}

	#applyTrajectory() {
		const angle = Math.random() * Math.PI * 2;
		const cap = 80 + Math.random() * this.#spread;
		this.#el.style.setProperty(`--burst-x`, `${Math.random() * Math.cos(angle) * cap}px`);
		this.#el.style.setProperty(`--burst-y`, `${Math.random() * Math.sin(angle) * cap}px`);
		this.#el.style.setProperty(`--fall-x`, `0px`);
		this.#el.style.setProperty(`--rot`, `${Math.floor(Math.random() * 365)}deg`);
		this.#el.style.setProperty(`--duration`, `${(this.#options.duration / 1000).toFixed(2)}s`);
		this.#el.style.animationDelay = `${Math.random() * 0.1}s`;
	}
}

export const hooray = (target, options = {}) => {
	const h = new Hooray(target, options);
	h.paint();
};
