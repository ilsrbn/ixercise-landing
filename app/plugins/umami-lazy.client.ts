function appendUmamiScript(websiteId: string, hostUrl: string) {
    if (document.querySelector("script[data-website-id]")) {
        return;
    }

    const script = document.createElement("script");
    script.src = `${hostUrl}/script.js`;
    script.defer = true;
    script.setAttribute("data-website-id", websiteId);
    document.head.append(script);
}

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig();
    const websiteId = String(runtimeConfig.public.umamiWebsiteId || "").trim();
    if (!websiteId) {
        return;
    }

    const hostUrl = String(runtimeConfig.public.umamiHostUrl || "https://cloud.umami.is").trim();
    let loaded = false;

    const load = () => {
        if (loaded) {
            return;
        }

        loaded = true;
        appendUmamiScript(websiteId, hostUrl);
        window.removeEventListener("pointerdown", load);
        window.removeEventListener("keydown", load);
        window.removeEventListener("scroll", load);
    };

    window.addEventListener("pointerdown", load, { once: true, passive: true });
    window.addEventListener("keydown", load, { once: true, passive: true });
    window.addEventListener("scroll", load, { once: true, passive: true });

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(load, { timeout: 5000 });
        return;
    }

    window.setTimeout(load, 5000);
});
