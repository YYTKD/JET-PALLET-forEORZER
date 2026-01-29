document.addEventListener("DOMContentLoaded", () => {
    const existingContainer = document.querySelector("[data-toast-container]");
    const toastContainer = existingContainer || document.createElement("div");

    if (!existingContainer) {
        toastContainer.className = "toast-container";
        toastContainer.dataset.toastContainer = "true";
        document.body.appendChild(toastContainer);
    }

    // Centralize toast creation so styling and timeouts stay consistent.
    const createToast = ({ message, type = "info", duration = 4000 } = {}) => {
        if (!message) {
            return;
        }

        const toast = document.createElement("div");
        toast.className = `toast toast--${type}`;
        toast.setAttribute("role", type === "error" ? "alert" : "status");

        const icon = document.createElement("span");
        icon.className = "toast__icon material-symbols-rounded";
        icon.textContent =
            type === "success" ? "check_circle" : type === "error" ? "error" : "info";

        const messageElement = document.createElement("div");
        messageElement.className = "toast__message";
        messageElement.textContent = message;

        const closeButton = document.createElement("button");
        closeButton.className = "toast__close material-symbols-rounded";
        closeButton.type = "button";
        closeButton.textContent = "close";
        closeButton.addEventListener("click", () => {
            toast.remove();
        });

        toast.appendChild(icon);
        toast.appendChild(messageElement);
        toast.appendChild(closeButton);
        toastContainer.appendChild(toast);

        if (duration > 0) {
            window.setTimeout(() => {
                toast.classList.add("toast--hide");
                toast.addEventListener(
                    "transitionend",
                    () => {
                        toast.remove();
                    },
                    { once: true },
                );
            }, duration);
        }
    };

    // Expose a lightweight toast API for other scripts.
    window.showToast = (message, options = {}) => {
        createToast({ message, ...options });
    };
});
