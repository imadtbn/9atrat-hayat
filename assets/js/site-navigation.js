/* Accessible menu control, shared by all site pages. */
(function () {
    "use strict";
    const button = document.querySelector(".header-content .mobile-menu-btn");
    const nav = document.querySelector(".header-content .site-nav");
    if (button && nav) {
        function setMenu(open) {
            nav.classList.toggle("is-open", open);
            button.setAttribute("aria-expanded", String(open));
            button.setAttribute("aria-label", open ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل");
        }
        button.addEventListener("click", function () {
            setMenu(button.getAttribute("aria-expanded") !== "true");
        });
        nav.addEventListener("click", function (event) {
            if (event.target.closest("a")) setMenu(false);
        });
        document.addEventListener("click", function (event) {
            if (!nav.contains(event.target) && !button.contains(event.target)) setMenu(false);
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
                setMenu(false);
                button.focus();
            }
        });
        window.addEventListener("resize", function () {
            if (window.innerWidth > 1100) setMenu(false);
        });
    }

    let installPrompt = null;
    window.addEventListener("beforeinstallprompt", function (event) {
        event.preventDefault();
        installPrompt = event;
    });
    document.querySelectorAll("[data-install-app]").forEach(function (button) {
        button.addEventListener("click", async function () {
            const promptEvent = installPrompt || window.deferredPrompt;
            if (promptEvent && typeof promptEvent.prompt === "function") {
                try {
                    await promptEvent.prompt();
                    installPrompt = null;
                } catch (error) {
                    window.alert("يمكنك تثبيت التطبيق من قائمة المتصفح.");
                }
            } else {
                window.alert("لتثبيت التطبيق اختر «إضافة إلى الشاشة الرئيسية» من قائمة المتصفح.");
            }
        });
    });
}());
