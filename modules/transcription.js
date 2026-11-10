import { MeuuhdiaTime } from "./time.js";
import { MeuuhdiaIcon } from "./icon.js";

// ? transcription on the right: minimum widths (in em) of the video and the transcription
const MIN_VIDEO_WIDTH = 24;
const SIDE_WIDTH = 20;
const SIDE_GAP = 1;

class MeuuhdiaTranscription {
    static addTranscription(locale, meuuhdia_wrapper, descriptions, video) {
        let wrapper = document.createElement("div");
        wrapper.classList.add("meuuhdia_transcription");
        wrapper.style.maxWidth = video.videoWidth + "px";

        let heading = document.createElement("div");
        heading.classList.add("meuuhdia_transcription_heading");

        let selectorContainer = document.createElement("div");
        selectorContainer.classList.add("meuuhdia_transcription_heading_lang");

        let label = document.createElement("label");
        label.setAttribute("for", "transcription_lang");
        label.textContent = locale.cc.transcriptionLabel;        

        let selector = document.createElement("select");
        selector.setAttribute("id", "transcription_lang");
        selector.setAttribute("name", "transcription_lang");
        selector.addEventListener("change", (evt) => MeuuhdiaTranscription.switchTranscription(locale, evt, video));

        let transcriptionOff = document.createElement("option");
        transcriptionOff.setAttribute("value", "off");
        transcriptionOff.textContent = locale.words.disable;
        selector.appendChild(transcriptionOff);

        descriptions.forEach(desc => {
            let opt = document.createElement("option");
            opt.setAttribute("value", desc.language);
            opt.setAttribute("lang", desc.language);
            opt.textContent = desc.label;
            selector.appendChild(opt);
        });

        selectorContainer.appendChild(label);
        selectorContainer.appendChild(selector);

        let transcriptionSide = document.createElement("ul");
        transcriptionSide.classList.add("meuuhdia_transcription_heading_side");
        transcriptionSide.classList.add("list-unstyled");

        let sides = [
            {
                "label": locale.cc.transcriptionBottom,
                "side": "bottom",
                "icon": MeuuhdiaIcon.createIcon("transcript_bottom")
            },
            {
                "label": locale.cc.transcriptionRight,
                "side": "right",
                "icon": MeuuhdiaIcon.createIcon("transcript_right")
            }
        ]

        sides.forEach(side => {
            let item = document.createElement("li");
            let isPressed = "bottom" == side.side ? "true" : "false";

            let btn = document.createElement("button");
            btn.dataset.side = side.side;
            btn.setAttribute("type", "button");
            btn.setAttribute("aria-pressed", isPressed);
            btn.setAttribute("title", side.label);
            btn.addEventListener("click", MeuuhdiaTranscription.moveTranscription);

            let label = document.createElement("span");
            label.textContent = side.label;
            label.classList.add("sr-only");

            btn.appendChild(label);
            btn.appendChild(side.icon);
            item.appendChild(btn);

            transcriptionSide.appendChild(item);
        });

        heading.appendChild(selectorContainer);
        heading.appendChild(transcriptionSide);
        wrapper.appendChild(heading);
        meuuhdia_wrapper.insertAdjacentElement("afterend", wrapper);

        MeuuhdiaTranscription.watchSpace(meuuhdia_wrapper, wrapper, video);
    }

    /**
     * ? The transcription goes on the right only if the video can shrink enough to leave it room
     *
     * @param {Node} meuuhdia_wrapper
     * @param {Node} transcription
     * @param {Node} video
     */
    static watchSpace(meuuhdia_wrapper, transcription, video) {
        let meuuhdia = meuuhdia_wrapper.closest(".meuuhdia");
        let sides = transcription.querySelector(".meuuhdia_transcription_heading_side");
        if(!meuuhdia || !("ResizeObserver" in window)) return;

        let update = () => {
            let parent = meuuhdia.parentElement;
            if(!parent) return;

            let parentStyle = window.getComputedStyle(parent);
            let available = document.fullscreenElement === meuuhdia
                ? window.innerWidth
                : parent.clientWidth - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight);
            let em = parseFloat(window.getComputedStyle(meuuhdia).fontSize) || 16;
            let fits = available >= (MIN_VIDEO_WIDTH + SIDE_WIDTH + SIDE_GAP) * em;

            sides.hidden = !fits;
            MeuuhdiaTranscription.applySide(meuuhdia, transcription, video, fits && "right" === meuuhdia.dataset.transcriptionSide);

            // the transcription on the right is as tall as the video
            meuuhdia.style.setProperty("--meuuhdia-video-height", meuuhdia_wrapper.offsetHeight + "px");
        };

        let observer = new ResizeObserver(() => window.requestAnimationFrame(update));
        observer.observe(meuuhdia.parentElement);
        observer.observe(meuuhdia_wrapper);
    }

    /**
     * ? Display the transcription below or on the right of the video
     */
    static applySide(meuuhdia, transcription, video, right) {
        meuuhdia.classList.toggle("meuuhdia--row", right);
        transcription.style.maxWidth = right ? "" : (video.videoWidth ? video.videoWidth + "px" : "");

        transcription.querySelectorAll(".meuuhdia_transcription_heading_side button").forEach(btn => {
            btn.setAttribute("aria-pressed", (right ? "right" : "bottom") === btn.dataset.side);
        });
    }

    static switchTranscription(locale, evt, video) {
        let desc = evt.currentTarget;
        let container = desc.closest(".meuuhdia_transcription");

        let previous_transcription = container.querySelector(".meuuhdia_transcription_container");
        if(previous_transcription) previous_transcription.remove();

        let track = desc.closest(".meuuhdia").querySelector("track[id='descriptions_"+desc.value+"']");

        // ? a displayed transcription stays visible in fullscreen
        desc.closest(".meuuhdia").dataset.transcription = track ? "on" : "off";

        if(track) {
            fetch(track.getAttribute("src"))
                .then(response => response.text())
                .then(text => {
                    let transcription_lines = JSON.parse(text);
                    let lines_container = document.createElement("ol");
                    lines_container.classList.add("meuuhdia_transcription_container");
                    lines_container.classList.add("list-unstyled");
                    lines_container.setAttribute("lang", desc.value);

                    for(let line in transcription_lines) {
                        let paragraph = document.createElement("li");

                        // ? "mm:ss Speaker": only the first space separates time from speaker (multi-word names allowed)
                        let separator = line.indexOf(" ");
                        let time = -1 === separator ? line : line.slice(0, separator);
                        let speaker = -1 === separator ? "" : line.slice(separator + 1).trim();

                        let infos = document.createElement("button");
                        infos.dataset.time = MeuuhdiaTime.convertTextToSeconds(time);
                        infos.classList.add("meuuhdia_transcription_info");
                        infos.addEventListener("click", (evt) => video.currentTime = evt.currentTarget.dataset.time);
                        MeuuhdiaTime.populateTimeNode(locale, infos, null, time);
                        let infos_voice = document.createElement("span");
                        infos_voice.textContent = speaker ? (" " + speaker + ":") : ":";
                        infos.appendChild(infos_voice);
                        paragraph.appendChild(infos);

                        let text = document.createElement("span");
                        text.textContent = transcription_lines[line];
                        paragraph.appendChild(text);

                        lines_container.appendChild(paragraph);
                    }

                    container.appendChild(lines_container);
                })
        }
    }

    static moveTranscription(evt) {
        let btn = evt.currentTarget;
        let meuuhdia = btn.closest(".meuuhdia");
        let transcription = btn.closest(".meuuhdia_transcription");

        // the user's choice, applied only while there is room for it
        meuuhdia.dataset.transcriptionSide = btn.dataset.side;
        MeuuhdiaTranscription.applySide(meuuhdia, transcription, meuuhdia.querySelector("video"), "right" === btn.dataset.side);
    }
}

export { MeuuhdiaTranscription };