class Hooray {
	static #supported =
		typeof document !== "undefined" &&
		typeof document.createElement("div").animate === "function" &&
		typeof Animation !== "undefined" &&
		"finished" in Animation.prototype;
	static #painting = new WeakSet();

	#pieces;
	#target;
	#options;

	constructor(target, options = {}) {
		this.#pieces = [];

		this.#target = target;

		this.#options = {
			count: 80,
			mobileCount: 40,
			duration: 3000,
			width: 16,
			height: 8,
			mobileWidth: 16,
			mobileHeight: 8,
			randomSize: true,
			spread: 380,
			mobileSpread: 120,
			once: false,
			...options,
		};

		this.#validate();
	}

	#validate() {
		if (this.#options.count > 1000)
			console.warn(
				"[hooray.js]:\nwarning: a high count is likely to impact performance.",
			);
	}

	// preload image before animation for slower connections
	#preloadImage() {
		if (!this.#options.image) return Promise.resolve();

		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve();
			img.onerror = () => resolve();
			img.src = this.#options.image;
		});
	}

	// virtual keyboard open/close shifts visual viewport - wait for it to settle
	#whenViewportSettled(callback) {
		const vv = window.visualViewport;
		if (!vv) {
			requestAnimationFrame(callback);
			return;
		}

		let timer;
		const settle = () => {
			vv.removeEventListener("resize", onResize);
			callback();
		};
		const onResize = () => {
			clearTimeout(timer);
			timer = setTimeout(settle, 100);
		};

		vv.addEventListener("resize", onResize);

		timer = setTimeout(settle, 100);
	}

	async paint() {
		if (!Hooray.#supported) return;
		if (window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true)
			return;
		if (this.#options.once && Hooray.#painting.has(this.#target)) return;

		Hooray.#painting.add(this.#target);

		await this.#preloadImage();

		this.#whenViewportSettled(() => {
			const frag = new DocumentFragment();

			const isMobile = window.innerWidth < 800;
			const count = isMobile
				? this.#options.mobileCount
				: this.#options.count;
			const spread = isMobile
				? this.#options.mobileSpread
				: this.#options.spread;

			const rect = this.#target.getBoundingClientRect();
			const origin = {
				x: rect.left + rect.width / 2,
				y: rect.top + rect.height / 2,
			};

			const viewportHeight = window.innerHeight;

			for (let i = 0; i < count; i++) {
				const piece = new Piece(
					this.#options,
					origin,
					spread,
					isMobile,
					viewportHeight,
				);
				this.#pieces.push(piece);
				frag.append(piece.el);
			}
			document.body.append(frag);

			Promise.all(this.#pieces.map((p) => p.finished.catch(() => {}))).then(
				() => {
					Hooray.#painting.delete(this.#target);
					this.#cleanup();
				},
			);
		});
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
	#animation;

	constructor(options, origin, spread, isMobile, viewportHeight) {
		this.#options = options;

		this.#el = document.createElement("span");
		this.#el.classList.add("hooray-piece");

		this.#applyBaseStyles();
		this.#applySize(isMobile);
		this.#applyStyles();
		this.#applyPosition(origin);
		this.#applyTrajectory(origin, spread, viewportHeight);
	}

	get el() {
		return this.#el;
	}

	get finished() {
		return this.#animation.finished;
	}

	#applyBaseStyles() {
		this.#el.style.display = "block";
		this.#el.style.position = "fixed";
		this.#el.style.pointerEvents = "none";

		if (this.#options.image) {
			if (this.#options.color) {
				this.#el.style.maskSize = "contain";
				this.#el.style.maskRepeat = "no-repeat";
				this.#el.style.maskPosition = "center";
				this.#el.style.webkitMaskSize = "contain";
				this.#el.style.webkitMaskRepeat = "no-repeat";
				this.#el.style.webkitMaskPosition = "center";
			} else {
				this.#el.style.backgroundSize = "contain";
				this.#el.style.backgroundRepeat = "no-repeat";
				this.#el.style.backgroundPosition = "center";
			}
		}
	}

	#applySize(isMobile) {
		const width = isMobile ? this.#options.mobileWidth : this.#options.width;
		const height = isMobile
			? this.#options.mobileHeight
			: this.#options.height;

		let wRand = 1;
		if (this.#options.randomSize) {
			wRand = Math.random();
		}

		let hRand = 1;
		if (this.#options.image) {
			hRand = wRand;
		} else if (this.#options.randomSize) {
			hRand = Math.random();
		}

		this.#el.style.width = `${wRand * width}px`;
		this.#el.style.height = `${hRand * height}px`;
	}

	#applyStyles() {
		if (!this.#options.image) {
			this.#el.style.backgroundColor = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
			return;
		}

		if (this.#options.color) {
			this.#el.style.backgroundColor = this.#options.color;
			this.#el.style.maskImage = `url(${this.#options.image})`;
			this.#el.style.webkitMaskImage = `url(${this.#options.image})`;
		} else {
			this.#el.style.backgroundImage = `url(${this.#options.image})`;
		}
	}

	#applyPosition(origin) {
		this.#el.style.left = `${origin.x}px`;
		this.#el.style.top = `${origin.y}px`;
	}

	#applyTrajectory(origin, spread, viewportHeight) {
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.sqrt(Math.random()) * spread;
		const burstX = Math.cos(angle) * radius;
		const burstY = Math.sin(angle) * radius;
		const rot = Math.floor(Math.random() * 360);

		const distanceToBottom =
			viewportHeight - origin.y + this.#options.height;
		const fallDistance = distanceToBottom * (1 + Math.random() * 0.4);

		this.#animation = this.#el.animate(
			[
				{
					transform: `translate(0, 0) rotate(${rot}deg)`,
					opacity: 1,
					easing: "ease-out",
					offset: 0,
				},
				{
					transform: `translate(${burstX}px, ${burstY}px) rotate(${rot + 120}deg)`,
					easing: "ease-in",
					offset: 0.15,
				},
				{
					transform: `translate(${burstX}px, ${fallDistance}px) rotate(${rot + 540}deg)`,
					opacity: 1,
					offset: 1,
				},
			],
			{
				duration: this.#options.duration,
				delay: Math.random() * 100,
				easing: "ease-out",
				fill: "both",
			},
		);
	}
}

export const hooray = (target, options = {}) => {
	const h = new Hooray(target, options);
	h.paint();
	return h;
};
