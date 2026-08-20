/*
 * AdSense Manager
 * تحميل كسول للوحدات، دفع لمرة واحدة لكل وحدة، ومعالجة صامتة للوحدات غير المملوءة.
 */
(function () {
    "use strict";

    var SELECTOR = '.ad-container[data-ad-lazy="true"] ins.adsbygoogle';
    var ROOT_MARGIN = "320px 0px";
    var MAX_WAIT_MS = 12000;
    var pushedAds = new WeakSet();
    var observedAds = new WeakSet();

    function getContainer(ad) {
        return ad.closest(".ad-container");
    }

    function setState(ad, state) {
        var container = getContainer(ad);
        if (container) {
            container.dataset.adState = state;
        }
    }

    function hasRenderedContent(ad) {
        return Boolean(
            ad.querySelector("iframe, ins, [id^=google_ads], [id^=aswift]") ||
            ad.getAttribute("data-ad-status") === "filled" ||
            ad.hasAttribute("data-adsbygoogle-status")
        );
    }

    function isUnfilled(ad) {
        return ad.getAttribute("data-ad-status") === "unfilled";
    }

    function markEmptyIfNeeded(ad) {
        if (isUnfilled(ad)) {
            setState(ad, "empty");
            return;
        }

        if (hasRenderedContent(ad)) {
            setState(ad, "loaded");
        }
    }

    function pushAd(ad) {
        if (pushedAds.has(ad) || ad.hasAttribute("data-adsbygoogle-status")) {
            return;
        }

        pushedAds.add(ad);
        setState(ad, "loading");

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            pushedAds.delete(ad);
            setState(ad, "failed");
            return;
        }

        window.setTimeout(function () {
            markEmptyIfNeeded(ad);
            if (!hasRenderedContent(ad) && !isUnfilled(ad)) {
                setState(ad, "empty");
            }
        }, MAX_WAIT_MS);
    }

    function observeAd(ad) {
        if (observedAds.has(ad) || !window.MutationObserver) {
            return;
        }

        observedAds.add(ad);
        var observer = new MutationObserver(function () {
            markEmptyIfNeeded(ad);
            if (isUnfilled(ad)) {
                observer.disconnect();
            }
        });

        observer.observe(ad, {
            attributes: true,
            attributeFilter: ["data-ad-status", "data-adsbygoogle-status"],
            childList: true,
            subtree: true
        });
    }

    function initAds() {
        var ads = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
        if (!ads.length) {
            return;
        }

        ads.forEach(observeAd);

        if ("IntersectionObserver" in window) {
            var lazyObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    pushAd(entry.target);
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: ROOT_MARGIN, threshold: 0.01 });

            ads.forEach(function (ad) {
                lazyObserver.observe(ad);
            });
        } else {
            ads.forEach(pushAd);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAds, { once: true });
    } else {
        initAds();
    }
})();