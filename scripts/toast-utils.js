(() => {
    // Provide a stable toast API so callers don't need to know implementation details.
    const showToast = (message, type = "info") => {
        if (typeof window.showToast === "function") {
            window.showToast(message, { type });
        }
    };

    window.toastUtils = {
        showToast,
    };
})();
