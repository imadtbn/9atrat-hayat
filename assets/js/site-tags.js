/*
 * Site Tags Loader
 * نقطة الدخول الوحيدة لـ GTM وGA4 وAdSense وMicrosoft Clarity.
 * لا تضع مفاتيح سرية هنا؛ هذه المعرفات عامة بطبيعتها.
 */
(function () {
    "use strict";

    if (window.__siteTagsLoaded) {
        return;
    }
    window.__siteTagsLoaded = true;

    var PLACEHOLDER = "xxxxxxxx";
    var config = Object.freeze({
        // ضع هنا معرف حاوية Google Tag Manager مثل GTM-XXXXXXX
        gtmId: "GTM-K9579C56",
        // ضع هنا معرف قياس Google Analytics 4 مثل G-XXXXXXXXXX؛ يُدار عبر GTM عند توفره
        ga4MeasurementId: "G-YQFRBCDS5B",
        // معرف AdSense الموجود في الموقع
        adsenseClient: "ca-pub-5656416032906373",
        // ضع هنا معرف مشروع Microsoft Clarity مثل xxxxxxxxxx
        clarityId: PLACEHOLDER
    });

    window.__siteTagsConfig = config;

    var state = {
        gtm: false,
        adsense: false,
        clarity: false
    };
    var supportsWeakSet = typeof WeakSet === "function";
    var queuedAds = supportsWeakSet ? new WeakSet() : [];

    function isConfigured(value) {
        return Boolean(value && value !== PLACEHOLDER);
    }

    function hasQueuedAd(ad) {
        if (supportsWeakSet) {
            return queuedAds.has(ad);
        }
        return queuedAds.indexOf(ad) !== -1;
    }

    function rememberQueuedAd(ad) {
        if (supportsWeakSet) {
            queuedAds.add(ad);
        } else {
            queuedAds.push(ad);
        }
    }

    function loadScript(src, onload) {
        var scripts = Array.prototype.slice.call(document.scripts);
        var existing = scripts.find(function (script) {
            return script.dataset.siteTagSrc === src || script.src === src;
        });

        if (existing) {
            if (existing.dataset.siteTagLoaded === "true") {
                if (onload) {
                    window.setTimeout(onload, 0);
                }
            } else if (onload) {
                existing.addEventListener("load", onload, { once: true });
            }
            return existing;
        }

        var script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.dataset.siteTagSrc = src;
        script.addEventListener("load", function () {
            script.dataset.siteTagLoaded = "true";
            if (onload) {
                onload();
            }
        }, { once: true });
        script.addEventListener("error", function () {
            script.dataset.siteTagError = "true";
        }, { once: true });
        document.head.appendChild(script);
        return script;
    }

    function runWhenIdle(callback, timeout) {
        if ("requestIdleCallback" in window) {
            window.requestIdleCallback(callback, { timeout: timeout });
        } else {
            window.setTimeout(callback, timeout);
        }
    }

    function loadGtm() {
        if (!isConfigured(config.gtmId) || state.gtm) {
            return;
        }

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            "gtm.start": new Date().getTime(),
            event: "gtm.js"
        });
        state.gtm = true;
        loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(config.gtmId));
    }

    function markAdState(ad, stateName) {
        var container = ad.closest(".ad-container");
        if (container) {
            container.dataset.adState = stateName;
        }
    }

    function observeAd(ad) {
        if (!window.MutationObserver) {
            return;
        }

        var observer = new MutationObserver(function () {
            if (ad.getAttribute("data-ad-status") === "unfilled") {
                markAdState(ad, "empty");
                observer.disconnect();
            } else if (ad.querySelector("iframe, ins, [id^=google_ads], [id^=aswift]")) {
                markAdState(ad, "loaded");
            }
        });

        observer.observe(ad, {
            attributes: true,
            attributeFilter: ["data-ad-status", "data-adsbygoogle-status"],
            childList: true,
            subtree: true
        });
    }

    function pushAd(ad) {
        if (
            hasQueuedAd(ad) ||
            ad.hasAttribute("data-adsbygoogle-status") ||
            ad.getAttribute("data-ad-status") === "unfilled"
        ) {
            return;
        }

        rememberQueuedAd(ad);
        ad.setAttribute("data-site-tag-queued", "true");
        markAdState(ad, "loading");

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
            ad.removeAttribute("data-site-tag-queued");
            markAdState(ad, "failed");
            return;
        }

        window.setTimeout(function () {
            if (ad.getAttribute("data-ad-status") === "unfilled") {
                markAdState(ad, "empty");
            } else if (
                !ad.hasAttribute("data-adsbygoogle-status") &&
                !ad.querySelector("iframe, ins, [id^=google_ads], [id^=aswift]")
            ) {
                markAdState(ad, "empty");
            }
        }, 12000);
    }

    function initializeAds() {
        var ads = Array.prototype.slice.call(document.querySelectorAll("ins.adsbygoogle"));
        if (!ads.length) {
            return;
        }

        ads.forEach(observeAd);

        if (!("IntersectionObserver" in window)) {
            ads.forEach(pushAd);
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                pushAd(entry.target);
                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: "320px 0px",
            threshold: 0.01
        });

        ads.forEach(function (ad) {
            observer.observe(ad);
        });
    }

    function loadAdsense() {
        if (!isConfigured(config.adsenseClient) || state.adsense) {
            return;
        }
        if (!document.querySelector("ins.adsbygoogle")) {
            return;
        }

        state.adsense = true;
        loadScript(
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(config.adsenseClient),
            initializeAds
        );
    }

    function loadClarity() {
        if (!isConfigured(config.clarityId) || state.clarity) {
            return;
        }

        state.clarity = true;
        window.clarity = window.clarity || function () {
            (window.clarity.q = window.clarity.q || []).push(arguments);
        };
        loadScript("https://www.clarity.ms/tag/" + encodeURIComponent(config.clarityId));
    }

    // GTM يُحمّل فقط عند توفير معرف فعلي، ويكون المسار الوحيد لـ GA4 وClarity.
    loadGtm();

    window.addEventListener("load", function () {
        runWhenIdle(loadAdsense, 2500);
        runWhenIdle(loadClarity, 5000);
    }, { once: true });
})();
