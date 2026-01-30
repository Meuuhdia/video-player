import { icons } from "../icons.js";

class MeuuhdiaIcon {
    /**
     * ? Create SVG icon
     * 
     * @param {string} name 
     * @returns {Node} <svg> element
     */
    static createIcon(name, label = null) {
        const xmlns = "http://www.w3.org/2000/svg";
        let svg = document.createElementNS(xmlns, 'svg');
        svg.setAttribute("xmlns", xmlns);   
        svg.setAttribute("viewBox", "0 0 400 400");
        
        if(label) {
            svg.setAttribute("aria-hidden", "false");
            svg.setAttribute("aria-label", label);
            svg.setAttribute("role", "img");
        } else svg.setAttribute("aria-hidden", "true");        

        let path = document.createElementNS(xmlns, "path");
        path.setAttribute("d", icons[name]);
        path.setAttribute("class", "meuuhdia_icon-path");

        svg.appendChild(path);

        return svg;
    }
}

export { MeuuhdiaIcon };