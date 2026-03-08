document.querySelectorAll("[data-toggle-group]").forEach((group) => {
    const groupKey = group.getAttribute("data-toggle-group");
    const panelsRoot = document.querySelector(`[data-toggle-panels="${groupKey}"]`);

    if (!panelsRoot) {
        return;
    }

    const buttons = group.querySelectorAll("[data-toggle-target]");
    const panels = panelsRoot.querySelectorAll("[data-toggle-panel]");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.getAttribute("data-toggle-target");

            buttons.forEach((item) => item.classList.remove("active"));
            panels.forEach((panel) => panel.classList.remove("active"));

            button.classList.add("active");

            const nextPanel = panelsRoot.querySelector(`[data-toggle-panel="${target}"]`);
            if (nextPanel) {
                nextPanel.classList.add("active");
            }
        });
    });
});
