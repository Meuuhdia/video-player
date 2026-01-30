import { MeuuhdiaTime } from "./time.js";
import { MeuuhdiaIcon } from "./icon.js";

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
    }

    static switchTranscription(locale, evt, video) {
        let desc = evt.currentTarget;
        let container = desc.closest(".meuuhdia_transcription");

        let previous_transcription = container.querySelector(".meuuhdia_transcription_container");
        if(previous_transcription) previous_transcription.remove();

        let track = desc.closest(".meuuhdia").querySelector("track[kind='descriptions'][srclang='"+desc.value+"']");

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

                        let infos_data = line.split(" ");
                        let infos = document.createElement("button");
                        infos.dataset.time = MeuuhdiaTime.convertTextToSeconds(infos_data[0]);
                        infos.classList.add("meuuhdia_transcription_info");
                        infos.addEventListener("click", (evt) => video.currentTime = evt.currentTarget.dataset.time);
                        MeuuhdiaTime.populateTimeNode(locale, infos, null, infos_data[0]);
                        let infos_voice = document.createElement("span");
                        infos_voice.textContent = (2 ===  infos_data.length) ? (" " + infos_data[1] + ":") : ":";
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
        let currentPosition = evt.currentTarget.closest(".meuuhdia_transcription_heading_side").querySelector("button[aria-pressed='true']");
        let container = evt.currentTarget.closest(".meuuhdia");
        let targetPosition = evt.currentTarget == currentPosition ? evt.currentTarget.closest(".meuuhdia_transcription_heading_side").querySelector("button[aria-pressed='false']") : evt.currentTarget;
        
        container.classList.toggle("meuuhdia--row");
        currentPosition.setAttribute("aria-pressed", "false");
        targetPosition.setAttribute("aria-pressed", "true");
    }
}

export { MeuuhdiaTranscription };