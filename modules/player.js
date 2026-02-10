import { MeuuhdiaControls } from "./controls.js";
import { locale as locale_en } from "../locale/en.js";
import { locale as locale_fr } from "../locale/fr.js";
import { locale as locale_it } from "../locale/it.js";

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
        let inherit_locale = meuuhdia.closest("[lang]") ? meuuhdia.closest("[lang]").getAttribute("lang").split("-")[0] : "en";
        let current_locale = meuuhdia.dataset.locale ?? inherit_locale;

        switch(current_locale) {
            case "fr":
                this.locale = locale_fr;
                break;
            case "it":
                this.locale = locale_it;
                break;
            default:
                this.locale = locale_en;
        }

        this.meuuhdia = meuuhdia;
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
        this.video.querySelectorAll("track").forEach(track => {
            const allowed_types = ["captions", "subtitles", "descriptions"];
            var current_type = track.getAttribute("kind");
            var extension = track.getAttribute("src")?.split(".").pop();

            if(allowed_types.includes(current_type) && ("descriptions" != current_type || "json" == extension)) {
                track.id = current_type + "_" + track.getAttribute("srclang");
            } else track.remove();            
        });
        
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