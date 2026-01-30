import { meuuhdiaDisclosure } from "./disclosure.js";
import { MeuuhdiaIcon } from "./icon.js";
import { MeuuhdiaTranscription } from "./transcription.js";

class MeuuhdiaCaption {
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
     * ? MeuuhdiaCaption constructor
     * 
     * @param {Object} locale 
     * @param {Node} wrapper 
     * @param {Node} video 
     * @param {Node} controls 
     */
    constructor(locale, wrapper, video, controls) {
        this.locale = locale;
        this.wrapper = wrapper;
        this.video = video;
        this.controls = controls;
    }

    /**
     * ? Create caption disclosure
     * 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/TextTrack
     * 
     * @param {TextTrack} textTracks 
     * @returns {Node} <li> element
     */
    createCaption(textTracks) {
        let selection = document.createElement("details");
        selection.setAttribute("open", "true");

        let legend = document.createElement("summary");
        legend.textContent = this.locale.cc.selection;
        selection.appendChild(legend);

        let tracks_list = document.createElement("ul");
        tracks_list.classList.add("list-unstyled");

        /**
         * ? disable caption
         */
        let offItem = document.createElement("li");
        offItem.classList.add("meuuhdia_caption_sublist");

        let offBtn = document.createElement("button");
        offBtn.textContent = this.locale.words.disable;
        offBtn.setAttribute("aria-pressed", "true");
        offBtn.setAttribute("type", "button");
        offBtn.addEventListener("click", this.#switchTrack.bind(this));

        offItem.appendChild(offBtn);
        tracks_list.appendChild(offItem);

        /**
         * ? caption types list
         */
        let captions = Object.values(textTracks).filter(track => "captions" === track.kind);
        let subtitles = Object.values(textTracks).filter(track => "subtitles" === track.kind);
        let descriptions = Object.values(textTracks).filter(track => "descriptions" === track.kind);

        if(0 < captions.length) tracks_list.appendChild(this.#createTrackList(captions, this.locale.cc.caption));
        if(0 < subtitles.length) tracks_list.appendChild(this.#createTrackList(subtitles, this.locale.cc.subtitles));
        if(0 < descriptions.length) MeuuhdiaTranscription.addTranscription(this.locale, this.wrapper, descriptions, this.video);
        
        selection.appendChild(tracks_list);

        /**
         * ? Caption customizer
         */
        let customize = document.createElement("details");
        let customize_legend = document.createElement("summary");
        customize_legend.textContent = this.locale.cc.customize;
        customize.appendChild(customize_legend);

        /**
         * ? Text section
         */

        let textSection = document.createElement("fieldset");
        let textSectionLegend = document.createElement("legend");
        textSectionLegend.textContent = this.locale.cc.textSectionLegend;
        textSection.appendChild(textSectionLegend);

        let text_options_list = document.createElement("ul");
        text_options_list.classList.add("meuuhdia_customize_options");
        text_options_list.classList.add("list-unstyled");

        //? font size
        this.wrapper.style.setProperty("--meuuhdia-cue-fontsize", "100%");
        text_options_list.appendChild(
            this.#createRangeInput(
                this.locale.cc.textSize,
                "meuuhdia_caption_size",
                "50",
                "200",
                "100",
                "10",
                "fontsize"
            )
        );

        //? color
        text_options_list.appendChild(
            this.#createSelector(
                this.locale.words.theme,
                "text_color",
                [
                    {
                        value: "default",
                        label: this.locale.cc.defaultColorOption
                    },
                    {
                        value: "custom",
                        label: this.locale.cc.customColorOption
                    }
                ]
            )
        );

        //? custom color
        text_options_list.appendChild(
            this.#createColorInput(
                this.locale.words.color,
                "meuuhdia_textcolor",
                "#FFFF00",
                "--meuuhdia-cue-color"
            )
        );

        textSection.appendChild(text_options_list);
        customize.appendChild(textSection);

        /**
         * ? Background section
         */
        let bgSection = document.createElement("fieldset");
        let bgSectionLegend = document.createElement("legend");
        bgSectionLegend.textContent = this.locale.cc.bgSectionLegend;
        bgSection.appendChild(bgSectionLegend);

        let bg_options_list = document.createElement("ul");
        bg_options_list.classList.add("meuuhdia_customize_options");
        bg_options_list.classList.add("list-unstyled");

        //? style
        bg_options_list.appendChild(
            this.#createSelector(
                this.locale.words.style,
                "bg_style",
                [
                    {
                        value: "stroke",
                        label: this.locale.cc.bgStyleStroke
                    },
                    {
                        value: "fill",
                        label: this.locale.cc.bgStyleFill
                    }
                ]
            )
        );

        //? color
        bg_options_list.appendChild(
            this.#createColorInput(
                this.locale.words.color,
                "meuuhdia_bgcolor",
                "#000000",
                "--meuuhdia-cue-bgcolor"
            )
        );
        
        bgSection.appendChild(bg_options_list);        
        customize.appendChild(bgSection);

        return meuuhdiaDisclosure.createDisclosure("caption", "caption_off", this.locale.controls.caption, [selection, customize], this.locale.words.disabled);
    }

    createCaptionContainer() {
        Object.values(this.video.textTracks).forEach(track => track.mode = "hidden");

        let container = document.createElement("div");
        container.setAttribute("aria-hidden", "true");
        container.setAttribute("hidden", "hidden");
        container.classList.add("meuuhdia_caption_container");

        return container;
    }

    /**
     * ? Create tracks list item
     * 
     * @param {Array} tracks 
     * @param {string} title 
     * @returns {Node} <li> element
     */
    #createTrackList(tracks, title) {
        let tracksContainer = document.createElement("li");
        tracksContainer.classList.add("meuuhdia_caption_sublist");

        let tracksHeader = document.createElement("p");
        tracksHeader.textContent = title;
        tracksContainer.appendChild(tracksHeader);

        if(1 < tracks.length) {
            let tracksList = document.createElement("ul");
            tracksList.classList.add("list-unstyled");

            tracks.forEach(el => {
                let item = document.createElement("li");
                let btn = document.createElement("button");

                btn.textContent = el.label;
                btn.dataset.track = el.id;
                btn.setAttribute("lang", el.language);
                btn.setAttribute("type", "button");
                btn.setAttribute("aria-pressed", "false");
                btn.addEventListener("click", this.#switchTrack.bind(this));

                item.appendChild(btn);
                tracksList.appendChild(item);
            });

            tracksContainer.appendChild(tracksList);
        } else {
            let trackBtn = document.createElement("button");
            trackBtn.textContent = tracks[0].label;
            trackBtn.dataset.track = tracks[0].id;
            trackBtn.setAttribute("lang", tracks[0].language);
            trackBtn.setAttribute("type", "button");
            trackBtn.setAttribute("aria-pressed", "false");
            trackBtn.addEventListener("click", this.#switchTrack.bind(this));

            tracksContainer.appendChild(trackBtn);
        }

        return tracksContainer;
    }

    /**
     * ? Create input color item
     * 
     * @param {string} label 
     * @param {string} identifiant 
     * @param {string} value 
     * @param {string} variable 
     * @returns {Node} <li> element
     */
    #createColorInput(label, identifiant, value, variable) {
        let color = document.createElement("li");
        let colorLabel = document.createElement("label");
        colorLabel.textContent = label;
        colorLabel.setAttribute("for", identifiant);

        let colorInput = document.createElement("input");
        colorInput.setAttribute("id", identifiant);
        colorInput.setAttribute("type", "color");
        colorInput.setAttribute("value", value);
        colorInput.setAttribute("disabled", true);
        colorInput.addEventListener("change", (evt) => {
            this.wrapper.style.setProperty(variable, evt.currentTarget.value);
        });

        color.appendChild(colorLabel);
        color.appendChild(colorInput);

        return color;
    }

    #switchTrack(evt) {
        let caption = this.controls.querySelector(".meuuhdia_caption");
        caption.querySelectorAll(".meuuhdia_caption_sublist button").forEach(opt => {
            if("true" == opt.getAttribute("aria-pressed")) {
                opt.setAttribute("aria-pressed", "false");
                let track_id = this.video.textTracks.getTrackById(opt.dataset.track);
                if(track_id) track_id.oncuechange = null;
            }            
        });

        evt.currentTarget.setAttribute("aria-pressed", "true");
        let caption_action = caption.querySelector(".meuuhdia_caption_action");
        let caption_icon = caption_action.querySelector(".meuuhdia_caption_action svg");
        let caption_container = this.wrapper.querySelector(".meuuhdia_caption_container");

        if(evt.currentTarget.dataset.track) {
            caption_action.replaceChild(MeuuhdiaIcon.createIcon("caption", this.locale.words.enabled), caption_icon);
            caption_container.removeAttribute("hidden");
            let track = this.video.textTracks.getTrackById(evt.currentTarget.dataset.track);
            this.#replaceActiveCues();

            track.oncuechange = this.#replaceActiveCues.bind(this);
        } else {
            caption_action.replaceChild(MeuuhdiaIcon.createIcon("caption_off", this.locale.words.disabled), caption_icon);
            caption_container.setAttribute("hidden", "hidden");
            caption_container.replaceChildren();
        }
    }

    #replaceActiveCues() {
        let active_track = this.controls.querySelector(".meuuhdia_caption button[data-track][aria-pressed='true']").dataset.track;
        let track = this.video.textTracks.getTrackById(active_track);
        let activeCues = track.activeCues;
        let cueContainer = this.wrapper.querySelector(".meuuhdia_caption_container");

        if(activeCues.length) {
            let cues = Object.values(activeCues).map(cue => {
                let cueHTML = cue.getCueAsHTML();
                let paragraph = document.createElement("p");
                if(cue.align) paragraph.dataset.align = cue.align;
                if(1 == cue.line) paragraph.classList.add("align-top");
                paragraph.classList.add("meuuhdia_caption_cue");
                paragraph.appendChild(cueHTML);
                return paragraph;
            });
    
            cueContainer.replaceChildren(...cues);
        } else cueContainer.replaceChildren();
    }

     /**
     * ? Create input range item
     * 
     * @param {string} label 
     * @param {string} identifiant 
     * @param {string} min 
     * @param {string} max 
     * @param {string} value 
     * @param {string} step 
     * @param {string} setting 
     * @returns {Node} <li> element
     */
     #createRangeInput(label, identifiant, min, max, value, step, setting) {
        let item = document.createElement("li");

        let item_label = document.createElement("label");
        item_label.textContent = label;
        item_label.setAttribute("for", identifiant);
        item.appendChild(item_label);

        let item_input = document.createElement("input");
        item_input.setAttribute("type", "range");
        item_input.setAttribute("min", min);
        item_input.setAttribute("max", max);
        item_input.setAttribute("step", step);
        item_input.setAttribute("value", value);        
        item_input.setAttribute("id", identifiant);

        if("fontsize" === setting) {
            item_input.classList.add("meuuhdia_range_horizontal");
            
            item_input.addEventListener("change", (evt) => {
                this.wrapper.style.setProperty("--meuuhdia-cue-fontsize", evt.currentTarget.value + "%");
            });
        }
        
        item.appendChild(item_input);
        return item;
    }

    /**
     * ? Create select item
     * 
     * @param {string} label 
     * @param {string} identifiant 
     * @param {Object} options 
     * @returns {Node} <li> element
     */
    #createSelector(label, identifiant, options) {
        let item = document.createElement("li");

        let item_label = document.createElement("label");
        item_label.textContent = label;
        item_label.setAttribute("for", identifiant);
        item.appendChild(item_label);

        let selector = document.createElement("select");        
        selector.setAttribute("id", identifiant);

        options.forEach(opt => {
            let newOpt = document.createElement("option");
            newOpt.setAttribute("value", opt.value);
            newOpt.textContent = opt.label;

            selector.appendChild(newOpt);
        });

        switch(identifiant) {
            case "text_color":
                selector.addEventListener("change", (evt) => {
                    this.wrapper.querySelector(".meuuhdia_caption_container").classList.toggle("meuuhdia_custom_colors");

                    this.wrapper.querySelectorAll("input[type='color']").forEach(el => el.toggleAttribute("disabled"));
                });
                break;
            case "bg_style":
                selector.addEventListener("change", (evt) => {
                    this.wrapper.querySelector(".meuuhdia_caption_container").classList.toggle("meuuhdia_caption_cue--fill");
                });
                break;
            default:
        }
        
        item.appendChild(selector);
        return item;
    }   
}

export { MeuuhdiaCaption };