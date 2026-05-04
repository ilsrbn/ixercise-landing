import { onMounted, ref, type ComputedRef } from "vue";
import { useAnalyticsEvent } from "./useAnalyticsEvent";
import { useElementVisibilityObserver } from "./useElementVisibilityObserver";
import type {
    GithubLocation,
    LandingAnalyticsProperties,
    LocaleCode,
    WaitlistCtaPlacement,
    WaitlistFormPlacement,
} from "./useAnalyticsEvent";

export function useLandingAnalytics(currentLocale: ComputedRef<string>) {
    const { trackEvent } = useAnalyticsEvent();
    const inlineWaitlistFormRef = ref<HTMLFormElement | null>(null);
    const mainWaitlistFormRef = ref<HTMLFormElement | null>(null);
    const hasTrackedLandingView = ref(false);
    const focusedWaitlistPlacements = new Set<WaitlistFormPlacement>();
    const viewedWaitlistForms = new Set<WaitlistFormPlacement>();

    function getAnalyticsLocale(): LocaleCode {
        return currentLocale.value === "ua" ? "ua" : "en";
    }

    function getLandingAnalyticsProperties(): LandingAnalyticsProperties | null {
        if (import.meta.server) {
            return null;
        }

        const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

        if (pathname !== "/" && pathname !== "/ua") {
            return null;
        }

        return {
            path: pathname,
            lang: pathname === "/ua" ? "ua" : "en",
        };
    }

    function trackWaitlistCta(placement: WaitlistCtaPlacement) {
        const analyticsProperties = getLandingAnalyticsProperties();

        if (!analyticsProperties) {
            return;
        }

        trackEvent("waitlist_cta_click", {
            placement,
            ...analyticsProperties,
        });
    }

    function trackGithubClick(location: GithubLocation) {
        trackEvent("github_click", {
            location,
            locale: getAnalyticsLocale(),
        });
    }

    function trackScreenshotSelect(screenshotId: string) {
        trackEvent("screenshot_select", {
            screenshot_id: screenshotId,
            source: "tab",
            locale: getAnalyticsLocale(),
        });
    }

    function trackLanguageSwitch(toLocaleCode: string) {
        trackEvent("language_switch", {
            from_locale: getAnalyticsLocale(),
            to_locale: toLocaleCode === "ua" ? "ua" : "en",
        });
    }

    function trackLandingViewed() {
        if (hasTrackedLandingView.value) {
            return;
        }

        const analyticsProperties = getLandingAnalyticsProperties();

        if (!analyticsProperties) {
            return;
        }

        hasTrackedLandingView.value = true;
        trackEvent("landing_viewed", analyticsProperties);
    }

    function trackWaitlistFocus(placement: WaitlistFormPlacement) {
        if (focusedWaitlistPlacements.has(placement)) {
            return;
        }

        const analyticsProperties = getLandingAnalyticsProperties();

        if (!analyticsProperties) {
            return;
        }

        focusedWaitlistPlacements.add(placement);
        trackEvent("waitlist_focus", {
            ...analyticsProperties,
            placement,
        });
    }

    function trackFormViewed(placement: WaitlistFormPlacement) {
        if (viewedWaitlistForms.has(placement)) {
            return;
        }

        const analyticsProperties = getLandingAnalyticsProperties();

        if (!analyticsProperties) {
            return;
        }

        viewedWaitlistForms.add(placement);
        trackEvent("form_viewed", {
            ...analyticsProperties,
            placement,
        });
    }

    useElementVisibilityObserver<WaitlistFormPlacement>({
        targets: [
            {
                elementRef: inlineWaitlistFormRef,
                value: "inline_after_hero",
            },
            {
                elementRef: mainWaitlistFormRef,
                value: "main_waitlist_section",
            },
        ],
        threshold: 0.45,
        onVisible: trackFormViewed,
    });

    onMounted(() => {
        trackLandingViewed();
    });

    return {
        inlineWaitlistFormRef,
        mainWaitlistFormRef,
        getAnalyticsLocale,
        getLandingAnalyticsProperties,
        trackGithubClick,
        trackLanguageSwitch,
        trackScreenshotSelect,
        trackWaitlistCta,
        trackWaitlistFocus,
    };
}
