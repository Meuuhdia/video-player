import { MeuuhdiaPlayer } from "./modules/player.js";
import { styles } from "./meuuhdia-css.js";

const Meuuhdia = {
	/**
	 * @type {NodeList}
	 */
	videoContainer: document.querySelectorAll(".meuuhdia"),

	init() {
		Meuuhdia.importStyles();

		Meuuhdia.videoContainer.forEach(meuuhdia => {
			let baseFontSize = 16 / parseInt(window.getComputedStyle(meuuhdia).getPropertyValue("font-size")) + "em";
			meuuhdia.style.fontSize = baseFontSize;

			const Player = new MeuuhdiaPlayer(meuuhdia);
			Player.initPlayer()
		});
	},
	importStyles() {
		let meuuhdiaLink = document.createElement("style");
		meuuhdiaLink.textContent = styles;
		document.head.appendChild(meuuhdiaLink);
	}
}

if ("undefined" !== typeof window) {
	if ("loading" === document.readyState) {
		document.addEventListener("DOMContentLoaded", Meuuhdia.init);
	} else Meuuhdia.init();
}

export {Meuuhdia as default};