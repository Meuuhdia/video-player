import { MeuuhdiaCaption } from "./caption.js";
import { meuuhdiaDisclosure } from "./disclosure.js";
import { MeuuhdiaIcon } from "./icon.js";
import { MeuuhdiaTime } from "./time.js";

class MeuuhdiaControls {
    /**
     * @type {Object}
     */
    locale;

    /**
     * @type {Node}
     */
    controls;

    /**
     * @type {Node}
     */
    wrapper;

    /**
     * @type {Node}
     */
    video;

    /**
     * @type {int}
     */
    controlsTimeout;

    /**
     * ? MeuuhdiaControls constructor
     * 
     * @param {Object} locale 
     * @param {Node} wrapper 
     * @param {Node} video 
     */
    constructor(locale, wrapper, video) {
        this.locale = locale;
        this.wrapper = wrapper;
        this.video = video;

        this.#initControls();
    }

    #initControls() {
        this.controls = document.createElement("ul");
        this.controls.classList.add("meuuhdia_controls", "list-unstyled");

        let play = this.#createButton("meuuhdia_playpause", MeuuhdiaIcon.createIcon("play"), this.locale.controls.play);
        let progress = this.#createProgressDuration();
        let volume = this.#createProgressVolume();
        let fullscreen = this.#createButton("meuuhdia_fs", MeuuhdiaIcon.createIcon("expand"), this.locale.controls.fullscreen);
        fullscreen.setAttribute("aria-pressed", "false");

        this.controls.appendChild(play);
        this.controls.appendChild(progress);
        this.controls.appendChild(volume);

        if(0 < this.video.textTracks.length) {
            let Caption = new MeuuhdiaCaption(this.locale, this.wrapper, this.video, this.controls);
            this.wrapper.appendChild(Caption.createCaptionContainer());
            this.controls.appendChild(Caption.createCaption(this.video.textTracks));            
        }

        this.controls.appendChild(fullscreen);
        this.#actionAddEventListeners();
        this.#setVolumeIcon();
        if(this.video.hasAttribute("autoplay")) this.#setIconPlayPause(true);
    }

    #actionAddEventListeners() {
        let playPause = this.controls.querySelector(".meuuhdia_playpause");
        let mute = this.controls.querySelector(".meuuhdia_mute");
        let volume = this.controls.querySelector(".meuuhdia_volume_bar");
        let fullscreen = this.controls.querySelector(".meuuhdia_fs");
        
        playPause.addEventListener("click", this.#actionPlayPause.bind(this));
        this.video.addEventListener("click", this.#actionPlayPause.bind(this));
        this.video.addEventListener("keyup", this.#checkKey.bind(this));
        mute.addEventListener("click", this.#actionMute.bind(this));
        volume.addEventListener("change", (evt) => {
            this.video.volume = evt.currentTarget.value;
        });
        this.#timeProgress();
        
        if (!document?.fullscreenEnabled) fullscreen.style.display = "none";
        else {
            fullscreen.addEventListener("click", this.#fullscreen.bind(this));

            document.addEventListener("fullscreenchange", (e) => {
                this.#setFullscreenData(!!document.fullscreenElement);
            });              
        }

        this.video.addEventListener("volumechange", this.#setVolumeIcon.bind(this));
    }

    #checkKey(evt) {
        if(evt.originalTarget == evt.currentTarget && "Space" == evt.code) {
            this.#actionPlayPause();
        }
    }

    #actionPlayPause() {
        if (this.video.paused || this.video.ended) {
            this.video.play();
            this.#toggleControls();
        } else {
            clearTimeout(this.controlsTimeout);
            this.video.pause();
        }

        this.#setIconPlayPause();
    }

    #setIconPlayPause($autoplay = false) {
        let play = this.controls.querySelector(".meuuhdia_playpause");
        let icon = play.querySelector("svg");
        let label = play.querySelector(".sr-only");

        if (!$autoplay & (this.video.paused || this.video.ended)) {
            play.replaceChild(MeuuhdiaIcon.createIcon("play"), icon);
            label.textContent = "lecture";            
        } else {
            play.replaceChild(MeuuhdiaIcon.createIcon("pause"), icon);
            label.textContent = "pause";
        }
    }

    #toggleControls() {
        clearTimeout(this.controlsTimeout);
        this.wrapper.classList.remove("meuuhdia_hide_controls");
        this.wrapper.removeEventListener("keydown", this.#toggleControls.bind(this), {once: true});
        this.wrapper.removeEventListener("mousemove", this.#toggleControls.bind(this), {once: true});

        if(this.video.paused) return;

        this.wrapper.addEventListener("keydown", this.#toggleControls.bind(this), {once: true});
        this.wrapper.addEventListener("mousemove", this.#toggleControls.bind(this), {once: true});

        this.controlsTimeout = setTimeout(() => this.wrapper.classList.add("meuuhdia_hide_controls"), 5000);
    }

    /**
     * ? Create button wrapped in list item
     * 
     * @param {string} btnClass 
     * @param {Node} btnIcon 
     * @param {string} btnLabel 
     * @returns {Node} <li> element
     */
    #createButton(btnClass, btnIcon, btnLabel) {
        let item = document.createElement("li");

        let btn = document.createElement("button");
        btn.classList.add(btnClass);
        btn.setAttribute("type", "button");

        let label = document.createElement("span");
        label.textContent = btnLabel;
        label.classList.add("sr-only");

        btn.appendChild(label);
        btn.appendChild(btnIcon);
        item.appendChild(btn);

        return item;
    }

    #createProgressDuration() {
        /**
         * ? Progress label
         */
        let progress_index = document.querySelectorAll(".meuuhdia_progress").length + 1;
        let progress_label = document.createElement("label");
        progress_label.setAttribute("for", "meuuhdia_progress_bar_" + progress_index);

        let progress_duration = document.createElement("span");
        progress_duration.classList.add("sr-only");
        progress_duration.textContent = this.locale.controls.progress + ": ";

        let progress_timenow = document.createElement("span");
        progress_timenow.classList.add("meuuhdia_timenow");
        MeuuhdiaTime.populateTimeNode(this.locale, progress_timenow, 0);

        let progress_time_separator = document.createElement("span");
        progress_time_separator.textContent = " / ";

        let progress_timetotal = document.createElement("span");
        progress_timetotal.classList.add("meuuhdia_timetotal");

        progress_label.appendChild(progress_duration);
        progress_label.appendChild(progress_timenow);
        progress_label.appendChild(progress_time_separator);
        progress_label.appendChild(progress_timetotal);

        /**
         * ? Progress bar
         */
        let progress_bar = document.createElement("input");
        progress_bar.setAttribute("id", "meuuhdia_progress_bar_" + progress_index);
        progress_bar.setAttribute("type", "range");
        progress_bar.classList.add("meuuhdia_progress_bar", "meuuhdia_range_horizontal");
        progress_bar.setAttribute("value", 0);
        progress_bar.setAttribute("min", 0);

        /**
         * ? Progress item list
         */
        let item = document.createElement("li");
        item.classList.add("meuuhdia_progress");
        item.appendChild(progress_label);
        item.appendChild(progress_bar);

        return item;
    }

    #createProgressVolume() {
        /**
         * ? Volume off
         */
        let volContentOff = document.createElement("button");
        volContentOff.setAttribute("type", "button");
        volContentOff.setAttribute("aria-pressed", "false");
        volContentOff.classList.add("meuuhdia_mute");

        let volContentOffLabel = document.createElement("span");
        volContentOffLabel.classList.add("sr-only");
        volContentOffLabel.textContent = this.locale.controls.mute;

        let volContentOffIcon = MeuuhdiaIcon.createIcon("volume_off");

        volContentOff.appendChild(volContentOffLabel);
        volContentOff.appendChild(volContentOffIcon);

        /**
         * ? Volume progress
         */
        let volProgress = document.createElement("input");
        volProgress.setAttribute("type", "range");
        volProgress.setAttribute("value", 1);
        volProgress.setAttribute("min", 0);
        volProgress.setAttribute("max", 1);
        volProgress.setAttribute("step", 0.1);
        volProgress.classList.add("meuuhdia_volume_bar", "meuuhdia_range_vertical");

        let volume = meuuhdiaDisclosure.createDisclosure("volume", "volume_high", this.locale.controls.volume, [volContentOff, volProgress], "100%");
        let progressLabel = volume.querySelector(".meuuhdia_disclosure_action").getAttribute("id");
        volume.querySelector(".meuuhdia_volume_bar").setAttribute("aria-labelledby", progressLabel);

        return volume;
    }

    #actionMute() {        
        let mute_btn = this.controls.querySelector(".meuuhdia_mute");

        this.video.muted = !this.video.muted;
        mute_btn.setAttribute("aria-pressed", this.video.muted);

        this.#setVolumeIcon();
    }

    #setVolumeIcon() {
        let volume = this.controls.querySelector(".meuuhdia_volume_action")
        let volume_icon = volume.querySelector("svg");
        let newIcon = null;

        if(this.video.muted) {
            volume.replaceChild(MeuuhdiaIcon.createIcon("volume_off", "0%"), volume_icon);
        } else {
            switch(this.video.volume) {
                case 0:
                    newIcon = "volume_off";
                    break;
                case 0.1:
                case 0.2:
                case 0.3:
                    newIcon = "volume_low";
                    break;
                case 0.4:
                case 0.5:
                case 0.6:
                    newIcon = "volume_mid";
                    break;
                default:
                    newIcon = "volume_high";
            }

            volume.replaceChild(MeuuhdiaIcon.createIcon(newIcon, this.video.volume * 100 + "%"), volume_icon);
        }        
    }

    #timeProgress() {
        let progress_container = this.controls.querySelector(".meuuhdia_progress");
        let progress = progress_container.querySelector(".meuuhdia_progress_bar");
        let timetotal_el = progress_container.querySelector(".meuuhdia_timetotal");
        MeuuhdiaTime.populateTimeNode(this.locale, timetotal_el, this.video.duration);
        
        this.video.addEventListener("loadedmetadata", () => progress.setAttribute("max", this.video.duration));

        this.video.addEventListener("timeupdate", () => {
            if (!progress.hasAttribute("max")) progress.setAttribute("max", this.video.duration);

            let duration_now = MeuuhdiaTime.convertSecondsToDuration(this.locale, this.video.currentTime);
            
            progress.value = this.video.currentTime;
            progress_container.querySelector(".meuuhdia_timenow span[aria-hidden]").textContent = duration_now.text;
            progress_container.querySelector(".meuuhdia_timenow .sr-only").textContent = duration_now.label;
        });

        progress.addEventListener("change", (evt) => this.video.currentTime = evt.currentTarget.value);
    }

    #fullscreen() {        
        if (document.fullscreenElement !== null) {            
            document.exitFullscreen();
        } else {
            this.wrapper.closest(".meuuhdia").requestFullscreen();
        }
    }

    #setFullscreenData(state) {
        let fs_btn = this.controls.querySelector(".meuuhdia_fs");
        let fs_icon = fs_btn.querySelector("svg");
        let icons = {
            false: "expand",
            true: "compress"
        };

        this.wrapper.closest(".meuuhdia").setAttribute("data-fullscreen", !!state);
        fs_btn.setAttribute("aria-pressed", !!state);
        fs_btn.replaceChild(MeuuhdiaIcon.createIcon(icons[state]), fs_icon);        
    }
}

export { MeuuhdiaControls };