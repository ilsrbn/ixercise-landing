import { computed, reactive, ref } from "vue";
import { useAnalyticsEvent } from "./useAnalyticsEvent";
import type {
    LandingAnalyticsProperties,
    LocaleCode,
    WaitlistErrorType,
    WaitlistFormPlacement,
} from "./useAnalyticsEvent";

type WaitlistResponse = {
    ok: boolean;
    delivery?: "email" | "log";
    id?: string;
    greetingId?: string;
};

type WaitlistSnapshot = LandingAnalyticsProperties & {
    locale: LocaleCode;
    placement: WaitlistFormPlacement;
    has_name: boolean;
    has_note: boolean;
};

type UseWaitlistSignupOptions = {
    endpoint: string;
    translate: (key: string) => string;
    getAnalyticsLocale: () => LocaleCode;
    getLandingAnalyticsProperties: () => LandingAnalyticsProperties | null;
};

function getWaitlistErrorType(error: unknown): WaitlistErrorType {
    const responseStatus =
        typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;
    const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
            ? (error as { statusCode?: number }).statusCode
            : undefined;
    const status = statusCode || responseStatus;

    if (status === 400 || status === 422) {
        return "validation";
    }

    if (status && status >= 500) {
        return "server";
    }

    if (!status) {
        return "network";
    }

    return "unknown";
}

export function useWaitlistSignup(options: UseWaitlistSignupOptions) {
    const { trackEvent } = useAnalyticsEvent();
    const waitlistForm = reactive({
        name: "",
        email: "",
        note: "",
        company: "",
    });
    const isSubmittingWaitlist = ref(false);
    const waitlistStatus = ref<"idle" | "success" | "error">("idle");
    const waitlistMessage = ref("");
    const waitlistSubmitLabel = computed(() =>
        isSubmittingWaitlist.value
            ? options.translate("waitlist.joining")
            : options.translate("actions.joinWaitlist"),
    );

    function getWaitlistSnapshot(
        placement: WaitlistFormPlacement,
    ): WaitlistSnapshot | null {
        const analyticsProperties = options.getLandingAnalyticsProperties();

        if (!analyticsProperties) {
            return null;
        }

        return {
            locale: options.getAnalyticsLocale(),
            ...analyticsProperties,
            placement,
            has_name: waitlistForm.name.trim().length > 0,
            has_note: waitlistForm.note.trim().length > 0,
        };
    }

    async function joinWaitlist(placement: WaitlistFormPlacement) {
        waitlistStatus.value = "idle";
        waitlistMessage.value = "";
        isSubmittingWaitlist.value = true;

        let waitlistSnapshot: WaitlistSnapshot | undefined;

        try {
            waitlistSnapshot = getWaitlistSnapshot(placement) ?? undefined;

            if (waitlistSnapshot) {
                trackEvent("waitlist_submit_attempt", waitlistSnapshot);
            }

            const response = await $fetch<WaitlistResponse>(options.endpoint, {
                method: "POST",
                body: {
                    name: waitlistForm.name.trim(),
                    email: waitlistForm.email.trim(),
                    note: waitlistForm.note.trim(),
                    company: waitlistForm.company,
                },
            });

            waitlistStatus.value = "success";
            waitlistMessage.value = options.translate("waitlist.success");
            waitlistForm.name = "";
            waitlistForm.email = "";
            waitlistForm.note = "";

            if (waitlistSnapshot) {
                trackEvent("waitlist_submit_success", {
                    ...waitlistSnapshot,
                    delivery: response.delivery,
                });
            }
        } catch (error) {
            const errorSnapshot =
                waitlistSnapshot ?? getWaitlistSnapshot(placement);

            waitlistStatus.value = "error";
            waitlistMessage.value = options.translate("waitlist.error");

            if (errorSnapshot) {
                trackEvent("waitlist_submit_error", {
                    locale: errorSnapshot.locale,
                    path: errorSnapshot.path,
                    lang: errorSnapshot.lang,
                    placement: errorSnapshot.placement,
                    error_type: getWaitlistErrorType(error),
                });
            }
        } finally {
            isSubmittingWaitlist.value = false;
        }
    }

    return {
        waitlistForm,
        isSubmittingWaitlist,
        waitlistStatus,
        waitlistMessage,
        waitlistSubmitLabel,
        joinWaitlist,
    };
}
