import { MeuuhdiaControls } from "./controls.js";
import { locale } from "../locale/fr.js";

class MeuuhdiaPlayer {
    /**
     * @type {Boolean}
     */
    static #supportsVideo = !!document.createElement("video").canPlayType;

    /**
     * @type {Object}
     */
    locale;

    /**
     * @type {Boolean}
     */
    meuuhdiaIsInit = false;

    /**
     * @type {Node}
     */
    meuuhdia;

    /**
     * @type {Node}
     */
    wrapper;

    /**
     * @type {Node}
     */
    video;

    /**
     * @type {Node}
     */
    controls;

    /**
     * ? MeuuhdiaPlayer constructor
     * 
     * @param {Node} meuuhdia 
     */
    constructor(meuuhdia) {
        this.meuuhdia = meuuhdia;
        this.locale = locale;
    }

    /**
     * ? Initialise player
     * @returns {void}
     */
    initPlayer() {
        let video_origin = this.meuuhdia ? this.meuuhdia.querySelector("video") : null;

        if(MeuuhdiaPlayer.#supportsVideo && video_origin && 0 < video_origin.querySelectorAll("source").length) {
            if(video_origin.readyState) {
                if(!this.meuuhdiaIsInit) this.#createMeuuhdiaWrapper();
                else this.#displayPlayer();
            } else video_origin.addEventListener("loadeddata", this.initPlayer.bind(this));
        }
    }

    /**
     * ? Create player wrapper
     * @private
     * @returns {void}
     */
    #createMeuuhdiaWrapper() {
        this.wrapper = this.meuuhdia.querySelector(".meuuhdia_wrapper");        
        this.wrapper.setAttribute("lang", this.locale.code);

        this.video = this.meuuhdia.querySelector("video");
        this.video.querySelectorAll("track").forEach(track => track.id = track.getAttribute("kind") + "_" + track.getAttribute("srclang"));
        
        let Controls = new MeuuhdiaControls(this.locale, this.wrapper, this.video);
        this.controls = Controls.controls;
        
        this.wrapper.appendChild(this.controls);

        this.meuuhdiaIsInit = true;
        this.#displayPlayer();
    }

    #displayPlayer() {
        if(this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            this.video.controls = false;
            this.wrapper.style.maxWidth = this.video.videoWidth + "px";
            this.video.classList.add("meuuhdia_video");
        } else this.video.addEventListener("loadeddata", this.#displayPlayer.bind(this));
    }
}

export { MeuuhdiaPlayer };