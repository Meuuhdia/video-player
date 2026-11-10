/**
 * ? Audio description read from a WebVTT track (<track kind="descriptions" src="*.vtt">)
 *
 * Two outputs:
 * - "speech": the browser speech synthesis reads each description
 * - "live": descriptions are sent to an aria-live region, read by the user's screen reader or braille display
 *
 * When a description is not finished at the end of its cue, the video can pause until it is (extended audio description)
 */

const STORAGE_KEY = "meuuhdia_audiodescription";
const DEFAULT_SETTINGS = { mode: "speech", rate: 1, pause: true };

// ? estimated screen reader speed, used to pause the video in "live" mode
const CHARS_PER_SECOND = 15;

// ? video volume ratio while a description is spoken
const DUCKING = 0.4;

class MeuuhdiaAudioDescription {
    /**
     * @type {{mode: string, rate: number, pause: boolean}}
     */
    settings;

    /**
     * @type {Node}
     */
    video;

    /**
     * @type {?TextTrack}
     */
    track = null;

    /**
     * @type {Node}
     */
    liveRegion;

    // ? incremented on every cancel: callbacks of cancelled descriptions are ignored
    #generation = 0;

    /**
     * @type {Array<VTTCue>} descriptions waiting to be read
     */
    #queue = [];

    /**
     * @type {?VTTCue} description being read
     */
    #speaking = null;

    /**
     * @type {Array<VTTCue>} descriptions interrupted by a user pause, read again on play
     */
    #pending = [];

    /**
     * @type {Set<VTTCue>} active cues already read
     */
    #read = new Set();

    #pausedByDescription = false;
    #pausing = false;
    #liveTimer = null;

    /**
     * @type {?{original: number, ducked: number}}
     */
    #ducked = null;

    #handlers;

    /**
     * @param {Node} wrapper
     * @param {Node} video
     */
    constructor(wrapper, video) {
        this.video = video;
        this.settings = MeuuhdiaAudioDescription.loadSettings();

        this.liveRegion = document.createElement("div");
        this.liveRegion.classList.add("sr-only", "meuuhdia_ad_live");
        this.liveRegion.setAttribute("aria-live", "polite");
        this.liveRegion.setAttribute("aria-atomic", "true");
        wrapper.appendChild(this.liveRegion);

        this.#handlers = {
            cuechange: this.#onCueChange.bind(this),
            pause: this.#onPause.bind(this),
            play: this.#onPlay.bind(this),
            seeking: this.#onSeeking.bind(this)
        };

        // ? voices are loaded asynchronously by some browsers: ask for them early
        if(MeuuhdiaAudioDescription.speechAvailable()) window.speechSynthesis.getVoices();
    }

    /**
     * ? Saved settings, defaults if storage is unavailable
     * @returns {{mode: string, rate: number, pause: boolean}}
     */
    static loadSettings() {
        try {
            let saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
            if(saved && "object" === typeof saved) return { ...DEFAULT_SETTINGS, ...saved };
        } catch(e) {}

        return { ...DEFAULT_SETTINGS };
    }

    static saveSettings(settings) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch(e) {}
    }

    /**
     * ? Speech synthesis API present
     * @returns {boolean}
     */
    static speechAvailable() {
        return "undefined" !== typeof window && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    }

    /**
     * @returns {boolean}
     */
    get active() {
        return null !== this.track;
    }

    /**
     * ? Update and save settings
     * @param {Object} changes
     */
    setSettings(changes) {
        let modeChanged = "mode" in changes && changes.mode !== this.settings.mode;

        Object.assign(this.settings, changes);
        MeuuhdiaAudioDescription.saveSettings(this.settings);

        if(modeChanged && this.active) {
            this.#cancel();
            this.#onCueChange();
        }
    }

    /**
     * ? Start reading a descriptions track
     * @param {TextTrack} track
     */
    enable(track) {
        this.disable();

        this.track = track;
        track.mode = "hidden";
        track.addEventListener("cuechange", this.#handlers.cuechange);
        ["pause", "play", "seeking"].forEach(type => this.video.addEventListener(type, this.#handlers[type]));

        // a description may already be active
        this.#onCueChange();
    }

    disable() {
        if(!this.track) return;

        this.track.removeEventListener("cuechange", this.#handlers.cuechange);
        ["pause", "play", "seeking"].forEach(type => this.video.removeEventListener(type, this.#handlers[type]));

        this.#cancel();
        this.#resume();
        this.liveRegion.textContent = "";
        this.track = null;
    }

    /**
     * ? Output really used: speech needs the API and at least one voice
     * @returns {string} "speech" or "live"
     */
    #output() {
        if("speech" !== this.settings.mode || !MeuuhdiaAudioDescription.speechAvailable()) return "live";
        return window.speechSynthesis.getVoices().length ? "speech" : "live";
    }

    #onCueChange() {
        if(!this.track) return;

        let active = Array.from(this.track.activeCues ?? []);

        // paused by the user (e.g. moving the progress bar): descriptions wait for play
        let waiting = this.video.paused && !this.#pausedByDescription;

        active.filter(cue => !this.#read.has(cue)).forEach(cue => {
            this.#read.add(cue);
            (waiting ? this.#pending : this.#queue).push(cue);
        });

        // forget cues that are over (only a seek can bring them back)
        this.#read.forEach(cue => {
            if(!active.includes(cue)) this.#read.delete(cue);
        });

        if(!this.#speaking) this.#next();

        // extended audio description: the cue is over but the description is not
        let unfinished = (this.#speaking && !active.includes(this.#speaking)) || this.#queue.some(cue => !active.includes(cue));

        if(unfinished && this.settings.pause && !this.video.paused) {
            this.#pausedByDescription = true;
            this.#pausing = true;
            this.video.pause();
        }
    }

    #next() {
        let cue = this.#queue.shift();

        if(!cue) {
            this.#speaking = null;
            this.#unduck();
            this.#resume();
            return;
        }

        this.#speaking = cue;
        let text = MeuuhdiaAudioDescription.cueText(cue);
        let generation = this.#generation;
        let done = () => {
            if(generation === this.#generation) this.#next();
        };

        if(!text) return done();

        if("speech" === this.#output()) this.#speak(text, done);
        else this.#announce(text, done);
    }

    /**
     * ? Read with the speech synthesis
     * Long texts are split into sentences: Chrome stops utterances after about 15 seconds
     */
    #speak(text, done) {
        let sentences = text.match(/[^.!?…]+[.!?…]*/g)?.map(sentence => sentence.trim()).filter(Boolean) ?? [text];
        let voice = this.#voice();

        this.#duck();

        sentences.forEach((sentence, index) => {
            let utterance = new SpeechSynthesisUtterance(sentence);
            utterance.lang = this.track.language;
            utterance.rate = this.settings.rate;
            if(voice) utterance.voice = voice;

            if(index === sentences.length - 1) {
                utterance.addEventListener("end", done);
                utterance.addEventListener("error", done);
            }

            window.speechSynthesis.speak(utterance);
        });
    }

    /**
     * ? Send to the screen reader, the duration is only estimated
     */
    #announce(text, done) {
        this.liveRegion.textContent = "";
        // a short delay makes screen readers announce identical texts again
        setTimeout(() => this.liveRegion.textContent = text, 50);

        this.#liveTimer = setTimeout(done, 50 + text.length / CHARS_PER_SECOND * 1000);
    }

    /**
     * ? Voice matching the track language, if any
     * @returns {?SpeechSynthesisVoice}
     */
    #voice() {
        let lang = (this.track.language || document.documentElement.lang || "").toLowerCase();
        let base = lang.split("-")[0];
        let voices = window.speechSynthesis.getVoices().filter(voice => voice.lang.toLowerCase().replace("_", "-").split("-")[0] === base);

        return voices.find(voice => voice.lang.toLowerCase().replace("_", "-") === lang)
            ?? voices.find(voice => voice.localService)
            ?? voices[0]
            ?? null;
    }

    /**
     * ? Stop everything being read
     */
    #cancel() {
        this.#generation++;
        if(MeuuhdiaAudioDescription.speechAvailable()) window.speechSynthesis.cancel();
        clearTimeout(this.#liveTimer);

        this.#queue = [];
        this.#speaking = null;
        this.#pending = [];
        this.#read.clear();
        this.#unduck();
    }

    /**
     * ? Play again if the video was paused by a description
     */
    #resume() {
        if(!this.#pausedByDescription) return;

        this.#pausedByDescription = false;
        this.video.play().catch(() => {});
    }

    #onPause() {
        if(this.#pausing) {
            this.#pausing = false;
            return;
        }

        // user pause: stop reading, the interrupted descriptions are read again on play
        let interrupted = [this.#speaking, ...this.#queue].filter(Boolean);
        let read = new Set(this.#read);

        this.#pausedByDescription = false;
        this.#cancel();
        this.#read = read;
        this.#pending = interrupted;
    }

    #onPlay() {
        // play pressed while waiting for a description: let it finish without pausing again
        this.#pausedByDescription = false;

        if(this.#pending.length) {
            this.#queue.push(...this.#pending);
            this.#pending = [];
            if(!this.#speaking) this.#next();
        }
    }

    #onSeeking() {
        let wasWaiting = this.#pausedByDescription;

        this.#pausedByDescription = false;
        this.#pausing = false;
        this.#cancel();

        if(wasWaiting) this.video.play().catch(() => {});
    }

    /**
     * ? Lower the video volume while speaking
     */
    #duck() {
        if(this.#ducked || this.video.muted || !this.video.volume) return;

        let original = this.video.volume;
        let ducked = Math.max(Math.round(original * DUCKING * 10) / 10, 0.1);

        this.#ducked = { original, ducked };
        this.video.dataset.meuuhdiaDucking = "true";
        this.video.volume = ducked;
    }

    #unduck() {
        if(!this.#ducked) return;

        let { original, ducked } = this.#ducked;
        this.#ducked = null;
        delete this.video.dataset.meuuhdiaDucking;

        // the user may have changed the volume meanwhile: keep their choice
        if(Math.abs(this.video.volume - ducked) < 0.001) this.video.volume = original;
        else this.video.dispatchEvent(new Event("volumechange"));
    }

    /**
     * ? Plain text of a cue
     * @param {VTTCue} cue
     * @returns {string}
     */
    static cueText(cue) {
        let text = "function" === typeof cue.getCueAsHTML ? cue.getCueAsHTML().textContent : cue.text.replace(/<[^>]+>/g, "");
        return text.replace(/\s+/g, " ").trim();
    }
}

export { MeuuhdiaAudioDescription };
