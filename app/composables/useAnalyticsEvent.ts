type LocaleCode = "en" | "ua";

type WaitlistLocation = "hero" | "footer";
type GithubLocation = "hero" | "footer" | "footer_nav" | "credit";
type WaitlistErrorType = "validation" | "network" | "server" | "unknown";
type WaitlistDelivery = "email" | "log";
type ScreenshotSource = "tab";

type AnalyticsEventPayloads = {
    waitlist_cta_click: {
        location: WaitlistLocation;
        locale: LocaleCode;
    };
    waitlist_submit_attempt: {
        locale: LocaleCode;
        has_name: boolean;
        has_note: boolean;
    };
    waitlist_submit_success: {
        locale: LocaleCode;
        has_name: boolean;
        has_note: boolean;
        delivery?: WaitlistDelivery;
    };
    waitlist_submit_error: {
        locale: LocaleCode;
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
    function trackEvent<Name extends AnalyticsEventName>(
        eventName: Name,
        data: AnalyticsEventPayloads[Name],
    ) {
        if (import.meta.server) {
            return;
        }

        try {
            window.umami?.track(eventName, data);
        } catch {
            // Analytics must never affect the visitor flow.
        }
    }

    return { trackEvent };
}
