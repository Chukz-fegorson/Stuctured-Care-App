const tabs = document.querySelectorAll("[data-workflow-target]");
const panels = document.querySelectorAll("[data-workflow]");

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-workflow-target");

        tabs.forEach((item) => item.classList.remove("active"));
        panels.forEach((panel) => panel.classList.remove("active"));

        tab.classList.add("active");

        const nextPanel = document.querySelector(`[data-workflow="${target}"]`);
        if (nextPanel) {
            nextPanel.classList.add("active");
        }
    });
});
