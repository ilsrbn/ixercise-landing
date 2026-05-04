import { useUmamiEventQueue } from "./useUmamiEventQueue";

export type LocaleCode = "en" | "ua";

export type LandingPath = "/" | "/ua";
export type WaitlistFormPlacement =
    | "inline_after_hero"
    | "main_waitlist_section";
export type WaitlistCtaPlacement = "hero" | "footer";
export type GithubLocation = "hero" | "footer" | "footer_nav" | "credit";
export type WaitlistErrorType =
    | "validation"
    | "network"
    | "server"
    | "unknown";
export type WaitlistDelivery = "email" | "log";
export type ScreenshotSource = "tab";

export type LandingAnalyticsProperties = {
    path: LandingPath;
    lang: LocaleCode;
};

type AnalyticsEventPayloads = {
    landing_viewed: {
        path: LandingPath;
        lang: LocaleCode;
    };
    form_viewed: {
        path: LandingPath;
        lang: LocaleCode;
        placement: WaitlistFormPlacement;
    };
    waitlist_focus: {
        path: LandingPath;
        lang: LocaleCode;
        placement: WaitlistFormPlacement;
    };
    waitlist_cta_click: {
        placement: WaitlistCtaPlacement;
        path: LandingPath;
        lang: LocaleCode;
    };
    waitlist_submit_attempt: {
        locale: LocaleCode;
        path: LandingPath;
        lang: LocaleCode;
        placement: WaitlistFormPlacement;
        has_name: boolean;
        has_note: boolean;
    };
    waitlist_submit_success: {
        locale: LocaleCode;
        path: LandingPath;
        lang: LocaleCode;
        placement: WaitlistFormPlacement;
        has_name: boolean;
        has_note: boolean;
        delivery?: WaitlistDelivery;
    };
    waitlist_submit_error: {
        locale: LocaleCode;
        path: LandingPath;
        lang: LocaleCode;
        placement: WaitlistFormPlacement;
        error_type: WaitlistErrorType;
    };
    github_click: {
        location: GithubLocation;
        locale: LocaleCode;
    };
    language_switch: {
        from_locale: LocaleCode;
        to_locale: LocaleCode;
    };
    screenshot_select: {
        screenshot_id: string;
        source: ScreenshotSource;
        locale: LocaleCode;
    };
};

type AnalyticsEventName = keyof AnalyticsEventPayloads;

type UmamiTracker = {
    track: (
        eventName: string,
        data?: Record<string, string | number | boolean | undefined>,
    ) => void | Promise<void>;
};

declare global {
    interface Window {
        umami?: UmamiTracker;
    }
}

export function useAnalyticsEvent() {
    const { trackOrQueue } = useUmamiEventQueue();

    function trackEvent<Name extends AnalyticsEventName>(
        eventName: Name,
        data: AnalyticsEventPayloads[Name],
    ) {
        if (import.meta.server) {
            return;
        }

        try {
            trackOrQueue({ eventName, data });
        } catch {
            // Analytics must never affect the visitor flow.
        }
    }

    return { trackEvent };
}
