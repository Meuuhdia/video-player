import { MeuuhdiaIcon } from "./icon.js";

export let meuuhdiaDisclosure = {
    init: function() {
        let disclosureActions = document.querySelectorAll(".meuuhdia_disclosure_action");

        disclosureActions.forEach(btn => {
            btn.addEventListener("click", meuuhdiaDisclosure.toggleDisclosure);
            btn.closest(".meuuhdia_disclosure").addEventListener("focusout", meuuhdiaDisclosure.closeDisclosure);
        });
    },

    /**
     * ? Create disclosure component
     * 
     * @param {string} actionName 
     * @param {string} actionIconName 
     * @param {string} actionLabel 
     * @param {Array<Node>} contentNodes 
     * @param {?string} iconLabel 
     * @returns {Node} <li> element
     */
    createDisclosure: function(actionName, actionIconName, actionLabel, contentNodes, iconLabel = null) {
        let index = document.querySelectorAll(".meuuhdia_disclosure").length + 1;

        /**
         * ? Action
         */
        let action = document.createElement("button");
        action.setAttribute("id", "meuuhdia_disclosure_action-" + actionName + "-" + index);
        action.setAttribute("type", "button");
        action.setAttribute("aria-expanded", "false");
        action.setAttribute("aria-controls", "meuuhdia_disclosure_content-" + actionName + "-" + index);
        action.classList.add(`meuuhdia_${actionName}_action`, "meuuhdia_disclosure_action");

        let actionLabelContainer = document.createElement("span");
        actionLabelContainer.classList.add("sr-only");
        actionLabelContainer.textContent = actionLabel;

        let actionIcon = MeuuhdiaIcon.createIcon(actionIconName, iconLabel);

        action.appendChild(actionLabelContainer);
        action.appendChild(actionIcon);
        action.addEventListener("click", meuuhdiaDisclosure.toggleDisclosure);

        /**
         * ? Content
         */
        let content = document.createElement("div");
        content.setAttribute("id", "meuuhdia_disclosure_content-" + actionName + "-" + index);
        content.classList.add("meuuhdia_disclosure_content", "meuuhdia_" + actionName + "_content");

        contentNodes.forEach(el => content.appendChild(el));

        /**
         * ? Caption item
         */
        let item = document.createElement("li");
        item.classList.add(`meuuhdia_${actionName}`, "meuuhdia_disclosure");

        item.appendChild(action);
        item.appendChild(content);
        item.addEventListener("focusout", meuuhdiaDisclosure.closeDisclosure);

        item.addEventListener("pointerdown", () => {
            item.dataset.pointerInside = "true";
            document.addEventListener("pointerup", () => setTimeout(() => delete item.dataset.pointerInside), { once: true });
        });

        return item;
    },

    /**
     * ? Toggle disclosure state
     * @function toggleDisclosure
     * @param {Event} evt 
     * @returns {void}
     */
    toggleDisclosure: function(evt) {
        let state = "false" == evt.currentTarget.getAttribute("aria-expanded");

        evt.currentTarget.setAttribute("aria-expanded", state);
        document.getElementById(evt.currentTarget.getAttribute("aria-controls")).style.display = state ? "inline-flex" : "none";
    },

    /**
     * ? Close disclosure
     * @function closeDisclosure
     * @param {Event} evt 
     * @returns {void}
     */
    closeDisclosure: function(evt) {
        let disclosure = evt.currentTarget.closest(".meuuhdia_disclosure");

        // focus lost to nothing, still inside, or moved by a click inside the disclosure
        if(!evt.relatedTarget || disclosure.contains(evt.relatedTarget) || disclosure.dataset.pointerInside) return;

        disclosure.querySelector(".meuuhdia_disclosure_action").setAttribute("aria-expanded", "false");
        disclosure.querySelector(".meuuhdia_disclosure_content").style.display = "none";
    }
}