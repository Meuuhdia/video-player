class MeuuhdiaTime {
    static populateTimeNode(locale, timeNode, seconds = null, duration_text = null) {
        let duration = null !== seconds ? MeuuhdiaTime.convertSecondsToDuration(locale, seconds) : null;
        let time_numeric = document.createElement("span");
        time_numeric.setAttribute("aria-hidden", true);
        time_numeric.textContent = duration ? duration.text : duration_text;
        timeNode.appendChild(time_numeric);

        let time_accname = document.createElement("span");
        time_accname.classList.add("sr-only");
        time_accname.textContent = duration ? duration.label : MeuuhdiaTime.getDurationLabel(locale, duration_text.split(":"));
        timeNode.appendChild(time_accname);
    }

    static convertSecondsToDuration(locale, seconds) {
        let slice = 3600 <= seconds ? 11 : 14;
        let duration_ISO = new Date(Math.round(seconds) * 1000).toISOString();
        let duration_text = duration_ISO.slice(slice, 19);
        let duration_datetime = "PT" + duration_ISO.slice(11, 19);
        let duration_label = MeuuhdiaTime.getDurationLabel(locale, duration_text.split(":"));

        return {
            text: duration_text,
            label: duration_label,
            datetime: duration_datetime
        }
    }

    static getDurationLabel(locale, duration_obj) {
        let response = "";

        if(3 === duration_obj.length) {
            let round = Math.round(duration_obj[0]);

            if(0 < round) {
                response += round + " " + (1 < round ? locale.datetime.hour.plur : locale.datetime.hour.sing) + ", ";
            }
        }

        duration_obj.forEach((el, index) => {
            let key = 0 === index ? "minute" : "second";
            let round = Math.round(el);

            response += round + " " + (1 < round ? locale.datetime[key].plur : locale.datetime[key].sing);

            if(0 === index) response += ", ";
        }, this);
        
        return response;
    }

    static convertTextToSeconds(duration_text) {
        let timeObj = duration_text.split(":");

        while(1 < timeObj.length) {
            let add = parseInt(timeObj.shift()) * 60;
            timeObj[0] = add + parseInt(timeObj[0]);
        }

        return timeObj[0];
    }
}

export { MeuuhdiaTime };