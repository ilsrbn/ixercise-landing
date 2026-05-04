import { onBeforeUnmount, onMounted, type Ref } from "vue";

type VisibilityTarget<Value extends string> = {
    elementRef: Ref<Element | null>;
    value: Value;
};

type UseElementVisibilityObserverOptions<Value extends string> = {
    targets: VisibilityTarget<Value>[];
    threshold?: number;
    onVisible: (value: Value, element: Element) => void;
};

export function useElementVisibilityObserver<Value extends string>(
    options: UseElementVisibilityObserverOptions<Value>,
) {
    let observer: IntersectionObserver | undefined;
    const targetValues = new Map<Element, Value>();

    onMounted(() => {
        if (
            import.meta.server ||
            typeof window === "undefined" ||
            !("IntersectionObserver" in window)
        ) {
            return;
        }

        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) {
                        continue;
                    }

                    const value = targetValues.get(entry.target);

                    if (value) {
                        options.onVisible(value, entry.target);
                        observer?.unobserve(entry.target);
                        targetValues.delete(entry.target);
                    }
                }
            },
            { threshold: options.threshold ?? 0 },
        );

        for (const target of options.targets) {
            const element = target.elementRef.value;

            if (element) {
                targetValues.set(element, target.value);
                observer.observe(element);
            }
        }
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
        targetValues.clear();
    });
}
