import { MeuuhdiaAudioDescription } from "./audiodescription.js";
import { MeuuhdiaCaption } from "./caption.js";
import { meuuhdiaDisclosure } from "./disclosure.js";
import { MeuuhdiaIcon } from "./icon.js";
import { MeuuhdiaTime } from "./time.js";
import { MeuuhdiaTranscription } from "./transcription.js";

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
     * @type {{standard: Array<Node>, described: Array<Node>}}
     */
    sources;

    /**
     * ? Playback state saved while an audio description switch is loading
     * @type {?{time: number, wasPlaying: boolean, rate: number}}
     */
    #pendingSwitch = null;

    /**
     * ? Audio described source currently loaded
     * @type {boolean}
     */
    #describedActive = false;

    /**
     * ? Reader of the audio description tracks (WebVTT)
     * @type {?MeuuhdiaAudioDescription}
     */
    audioDescription = null;

    static #audioDescriptionIndex = 0;

    /**
     * ? MeuuhdiaControls constructor
     * 
     * @param {Object} locale 
     * @param {Node} wrapper 
     * @param {Node} video 
     * @param {Object} sources standard and audio described <source> elements
     */
    constructor(locale, wrapper, video, sources = { standard: [], described: [] }) {
        this.locale = locale;
        this.wrapper = wrapper;
        this.video = video;
        this.sources = sources;

        this.#initControls();
    }

    #initControls() {
        this.controls = document.createElement("ul");
        this.controls.classList.add("meuuhdia_controls", "list-unstyled");

        let play = this.#createButton("meuuhdia_playpause", MeuuhdiaIcon.createIcon("play"), this.locale.controls.play);
        let progress = this.#createProgressDuration();
        let volume = this.#createProgressVolume();
        let fullscreen = this.#createButton("meuuhdia_fs", MeuuhdiaIcon.createIcon("expand"), this.locale.controls.fullscreen);
        fullscreen.querySelector("button").setAttribute("aria-pressed", "false");

        this.controls.appendChild(play);
        this.controls.appendChild(progress);
        this.controls.appendChild(volume);

        let textTracks = Array.from(this.video.textTracks);
        let adTracks = textTracks.filter(track => track.id.startsWith("audiodescription_"));
        let captionTracks = textTracks.filter(track => ["captions", "subtitles"].includes(track.kind));
        let transcriptions = textTracks.filter(track => track.id.startsWith("descriptions_"));

        if(0 < captionTracks.length) {
            // the caption menu also adds the transcription
            let Caption = new MeuuhdiaCaption(this.locale, this.wrapper, this.video, this.controls);
            this.wrapper.appendChild(Caption.createCaptionContainer());
            this.controls.appendChild(Caption.createCaption(this.video.textTracks));            
        } else if(0 < transcriptions.length) {
            // transcription only: no caption button
            MeuuhdiaTranscription.addTranscription(this.locale, this.wrapper, transcriptions, this.video);
        }

        if(0 < adTracks.length) {
            // descriptions to read (and maybe a recorded version): menu
            this.controls.appendChild(this.#createAudioDescriptionMenu(adTracks));
        } else if(0 < this.sources.described.length) {
            // recorded version only: simple toggle button
            let audiodescription = this.#createButton("meuuhdia_ad", MeuuhdiaIcon.createIcon("audiodescription_off", this.locale.words.disabled), this.locale.controls.audiodescription);
            let audiodescription_btn = audiodescription.querySelector("button");
            audiodescription_btn.setAttribute("aria-pressed", "false");
            audiodescription_btn.addEventListener("click", this.#switchAudioDescription.bind(this));
            this.controls.appendChild(audiodescription);
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

        // the video can also be paused or played by the audio description
        this.video.addEventListener("play", () => this.#setIconPlayPause());
        this.video.addEventListener("pause", () => this.#setIconPlayPause());

        let showControls = this.#toggleControls.bind(this);
        let player = this.wrapper.closest(".meuuhdia") ?? this.wrapper;
        ["mousemove", "pointerdown", "keydown", "focusin"].forEach(type => player.addEventListener(type, showControls));
        this.video.addEventListener("play", showControls);
        this.video.addEventListener("pause", showControls);
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
            label.textContent = this.locale.controls.play;
        } else {
            play.replaceChild(MeuuhdiaIcon.createIcon("pause"), icon);
            label.textContent = this.locale.controls.pause;
        }
    }

    #toggleControls() {
        clearTimeout(this.controlsTimeout);
        this.wrapper.classList.remove("meuuhdia_hide_controls");

        if(this.video.paused || this.video.ended) return;

        this.controlsTimeout = setTimeout(() => {
            // still in use: pointer over the controls or a menu open
            if(this.controls.matches(":hover") || this.controls.querySelector('[aria-expanded="true"]')) return this.#toggleControls();

            this.wrapper.classList.add("meuuhdia_hide_controls");
        }, 5000);
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
        // volume temporarily lowered while a description is spoken
        if("true" === this.video.dataset.meuuhdiaDucking) return;

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

        // the duration may change when switching to the audio described version
        this.video.addEventListener("durationchange", () => {
            if(!this.video.duration) return;
            progress.setAttribute("max", this.video.duration);
            timetotal_el.replaceChildren();
            MeuuhdiaTime.populateTimeNode(this.locale, timetotal_el, this.video.duration);
        });

        // while the user drags the progress bar, playback must not move it back
        let dragging = false;
        progress.addEventListener("input", () => dragging = true);

        this.video.addEventListener("timeupdate", () => {
            if (!progress.hasAttribute("max")) progress.setAttribute("max", this.video.duration);

            let duration_now = MeuuhdiaTime.convertSecondsToDuration(this.locale, this.video.currentTime);
            
            if(!dragging) progress.value = this.video.currentTime;
            progress_container.querySelector(".meuuhdia_timenow span[aria-hidden]").textContent = duration_now.text;
            progress_container.querySelector(".meuuhdia_timenow .sr-only").textContent = duration_now.label;
        });

        progress.addEventListener("change", (evt) => {
            dragging = false;
            this.video.currentTime = evt.currentTarget.value;
        });
    }

    #fullscreen() {        
        if (document.fullscreenElement !== null) {            
            document.exitFullscreen();
        } else {
            this.wrapper.closest(".meuuhdia").requestFullscreen();
        }
    }

    /**
     * ? Toggle button (recorded version only)
     */
    #switchAudioDescription() {
        let btn = this.controls.querySelector(".meuuhdia_ad");
        let enable = "true" !== btn.getAttribute("aria-pressed");

        this.#setDescribedSource(enable);

        btn.setAttribute("aria-pressed", enable);
        btn.replaceChild(
            MeuuhdiaIcon.createIcon(enable ? "audiodescription" : "audiodescription_off", enable ? this.locale.words.enabled : this.locale.words.disabled),
            btn.querySelector("svg")
        );
        this.wrapper.closest(".meuuhdia").setAttribute("data-audiodescription", enable);
    }

    /**
     * ? Swap between standard and audio described sources, keeping position and playback state
     *
     * @param {boolean} enable
     * @param {?Function} onReady called once the new source is positioned
     */
    #setDescribedSource(enable, onReady = null) {
        let target = enable ? this.sources.described : this.sources.standard;
        this.#describedActive = enable;

        // a second click while loading keeps the state saved by the first one (currentTime is already reset)
        let state = this.#pendingSwitch ?? {
            time: this.video.currentTime,
            wasPlaying: !this.video.paused && !this.video.ended,
            rate: this.video.playbackRate
        };
        this.#pendingSwitch = state;

        this.video.querySelectorAll("source").forEach(source => source.remove());
        let firstTrack = this.video.querySelector("track");
        target.forEach(source => this.video.insertBefore(source, firstTrack));
        this.video.load();

        this.video.addEventListener("loadedmetadata", () => {
            this.#pendingSwitch = null;
            this.video.currentTime = Math.min(state.time, this.video.duration || state.time);
            this.video.playbackRate = state.rate;

            if(state.wasPlaying) {
                this.video.play()
                    .then(() => this.#setIconPlayPause())
                    .catch(() => this.#setIconPlayPause());
            } else this.#setIconPlayPause();

            if(onReady) onReady();
        }, { once: true });
    }

    /**
     * ? Audio description menu: off, recorded version, descriptions to read and their settings
     *
     * @param {Array<TextTrack>} tracks
     * @returns {Node} <li> element
     */
    #createAudioDescriptionMenu(tracks) {
        let index = ++MeuuhdiaControls.#audioDescriptionIndex;
        this.audioDescription = new MeuuhdiaAudioDescription(this.wrapper, this.video);

        /**
         * ? Choices
         */
        let selection = document.createElement("details");
        selection.setAttribute("open", "true");

        let legend = document.createElement("summary");
        legend.textContent = this.locale.ad.selection;
        selection.appendChild(legend);

        let choices = document.createElement("ul");
        choices.classList.add("list-unstyled");

        let off = document.createElement("li");
        off.classList.add("meuuhdia_caption_sublist");
        off.appendChild(this.#createAudioDescriptionChoice(this.locale.words.disable, "off", true));
        choices.appendChild(off);

        // the recorded version comes first: it is the preferred one
        if(0 < this.sources.described.length) {
            let recorded = document.createElement("li");
            recorded.classList.add("meuuhdia_caption_sublist");
            recorded.appendChild(this.#createAudioDescriptionChoice(this.locale.ad.recorded, "recorded"));
            choices.appendChild(recorded);
        }

        let spoken = document.createElement("li");
        spoken.classList.add("meuuhdia_caption_sublist");

        let spokenHeader = document.createElement("p");
        spokenHeader.textContent = this.locale.ad.spoken;
        spoken.appendChild(spokenHeader);

        let spokenList = document.createElement("ul");
        spokenList.classList.add("list-unstyled");
        tracks.forEach(track => {
            let item = document.createElement("li");
            let btn = this.#createAudioDescriptionChoice(track.label || track.language, track.id);
            if(track.language) btn.setAttribute("lang", track.language);
            item.appendChild(btn);
            spokenList.appendChild(item);
        });
        spoken.appendChild(spokenList);
        choices.appendChild(spoken);

        selection.appendChild(choices);

        /**
         * ? Settings
         */
        let customize = document.createElement("details");
        let customizeLegend = document.createElement("summary");
        customizeLegend.textContent = this.locale.cc.customize;
        customize.appendChild(customizeLegend);

        let options = document.createElement("ul");
        options.classList.add("meuuhdia_customize_options", "list-unstyled");

        let settings = this.audioDescription.settings;
        let speech = MeuuhdiaAudioDescription.speechAvailable();

        // ? output
        let mode = document.createElement("select");
        [
            { value: "speech", label: this.locale.ad.modeSpeech },
            { value: "live", label: this.locale.ad.modeLive }
        ].forEach(opt => {
            let option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            if("speech" === opt.value && !speech) option.disabled = true;
            mode.appendChild(option);
        });
        mode.value = speech ? settings.mode : "live";
        mode.addEventListener("change", evt => this.audioDescription.setSettings({ mode: evt.currentTarget.value }));
        options.appendChild(this.#createSetting(this.locale.ad.mode, "meuuhdia_ad_mode_" + index, mode));

        // ? speech rate
        let rate = document.createElement("input");
        rate.type = "range";
        rate.min = "0.5";
        rate.max = "2";
        rate.step = "0.1";
        rate.value = settings.rate;
        rate.classList.add("meuuhdia_range_horizontal");
        rate.addEventListener("change", evt => this.audioDescription.setSettings({ rate: parseFloat(evt.currentTarget.value) }));
        options.appendChild(this.#createSetting(this.locale.ad.rate, "meuuhdia_ad_rate_" + index, rate));

        // ? pause until the description is finished
        let pause = document.createElement("input");
        pause.type = "checkbox";
        pause.checked = settings.pause;
        pause.addEventListener("change", evt => this.audioDescription.setSettings({ pause: evt.currentTarget.checked }));
        options.appendChild(this.#createSetting(this.locale.ad.pause, "meuuhdia_ad_pause_" + index, pause));

        customize.appendChild(options);

        return meuuhdiaDisclosure.createDisclosure("ad", "audiodescription_off", this.locale.controls.audiodescription, [selection, customize], this.locale.words.disabled);
    }

    /**
     * ? Audio description choice button
     *
     * @param {string} label
     * @param {string} choice "off", "recorded" or a track id
     * @param {boolean} pressed
     * @returns {Node} <button> element
     */
    #createAudioDescriptionChoice(label, choice, pressed = false) {
        let btn = document.createElement("button");
        btn.textContent = label;
        btn.dataset.choice = choice;
        btn.setAttribute("type", "button");
        btn.setAttribute("aria-pressed", pressed);
        btn.addEventListener("click", this.#selectAudioDescription.bind(this));

        return btn;
    }

    /**
     * ? Setting row: label and its field
     *
     * @param {string} label
     * @param {string} id
     * @param {Node} field
     * @returns {Node} <li> element
     */
    #createSetting(label, id, field) {
        let item = document.createElement("li");

        let fieldLabel = document.createElement("label");
        fieldLabel.textContent = label;
        fieldLabel.setAttribute("for", id);
        field.setAttribute("id", id);

        // checkbox before its label
        if("checkbox" === field.type) {
            item.classList.add("meuuhdia_customize_check");
            item.appendChild(field);
            item.appendChild(fieldLabel);
        } else {
            item.appendChild(fieldLabel);
            item.appendChild(field);
        }

        return item;
    }

    #selectAudioDescription(evt) {
        let choice = evt.currentTarget.dataset.choice;
        let menu = this.controls.querySelector(".meuuhdia_ad");

        menu.querySelectorAll("button[data-choice]").forEach(btn => btn.setAttribute("aria-pressed", btn === evt.currentTarget));

        let enabled = "off" !== choice;
        let action = menu.querySelector(".meuuhdia_ad_action");
        action.replaceChild(
            MeuuhdiaIcon.createIcon(enabled ? "audiodescription" : "audiodescription_off", enabled ? this.locale.words.enabled : this.locale.words.disabled),
            action.querySelector("svg")
        );
        this.wrapper.closest(".meuuhdia").setAttribute("data-audiodescription", enabled);

        // descriptions start once the right source is loaded and positioned
        let button = evt.currentTarget;
        let startDescriptions = () => {
            // another choice may have been made while the source was loading
            if("true" !== button.getAttribute("aria-pressed")) return;

            let track = this.video.textTracks.getTrackById(choice);
            if(track) this.audioDescription.enable(track);
            else this.audioDescription.disable();
        };

        let recorded = "recorded" === choice;
        if(recorded !== this.#describedActive) {
            this.audioDescription.disable();
            this.#setDescribedSource(recorded, startDescriptions);
        } else startDescriptions();
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