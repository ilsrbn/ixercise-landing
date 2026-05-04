type QueuedUmamiEvent = {
    eventName: string;
    data?: Record<string, string | number | boolean | undefined>;
};

const pendingAnalyticsEvents: QueuedUmamiEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let flushAttempts = 0;
const maxFlushAttempts = 30;
const flushIntervalMs = 250;

function getUmamiTracker() {
    if (import.meta.server || typeof window === "undefined") {
        return undefined;
    }

    return window.umami;
}

function sendToUmami(event: QueuedUmamiEvent) {
    getUmamiTracker()?.track(event.eventName, event.data);
}

function clearQueue() {
    pendingAnalyticsEvents.splice(0);
    flushAttempts = 0;
}

function flushPendingAnalyticsEvents() {
    flushTimer = undefined;

    const umami = getUmamiTracker();

    if (umami) {
        const events = pendingAnalyticsEvents.splice(0);

        for (const event of events) {
            umami.track(event.eventName, event.data);
        }

        flushAttempts = 0;
        return;
    }

    if (pendingAnalyticsEvents.length === 0 || flushAttempts >= maxFlushAttempts) {
        clearQueue();
        return;
    }

    flushAttempts += 1;
    flushTimer = setTimeout(flushPendingAnalyticsEvents, flushIntervalMs);
}

export function useUmamiEventQueue() {
    function trackOrQueue(event: QueuedUmamiEvent) {
        if (import.meta.server || typeof window === "undefined") {
            return;
        }

        if (getUmamiTracker()) {
            sendToUmami(event);
            return;
        }

        pendingAnalyticsEvents.push(event);

        if (!flushTimer) {
            flushTimer = setTimeout(
                flushPendingAnalyticsEvents,
                flushIntervalMs,
            );
        }
    }

    return { trackOrQueue };
}
