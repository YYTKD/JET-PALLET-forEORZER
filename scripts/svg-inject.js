// Inject inline SVGs on demand so icon theming stays consistent.
const initializeSvgInject = (root = document) => {
    if (typeof window.SVGInject !== "function") {
        return;
    }
    const targets = root.querySelectorAll("img.js-svg-inject");
    if (targets.length === 0) {
        return;
    }
    window.SVGInject(targets);
};

document.addEventListener("DOMContentLoaded", () => {
    initializeSvgInject();
});

window.initializeSvgInject = initializeSvgInject;
