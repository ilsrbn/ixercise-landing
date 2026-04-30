import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";

type LazyEmblaState = {
    viewportRef: Ref<HTMLElement | null>;
    api: ShallowRef<EmblaCarouselType | null>;
};

export function useLazyEmbla(
    options: EmblaOptionsType,
    threshold = 0.2,
): LazyEmblaState {
    const viewportRef = ref<HTMLElement | null>(null);
    const api = shallowRef<EmblaCarouselType | null>(null);
    let observer: IntersectionObserver | null = null;

    const mountEmbla = async () => {
        if (!viewportRef.value || api.value) {
            return;
        }

        const { default: EmblaCarousel } = await import("embla-carousel");
        api.value = EmblaCarousel(viewportRef.value, options);
    };

    onMounted(() => {
        const viewport = viewportRef.value;
        if (!viewport) {
            return;
        }

        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) {
                        continue;
                    }

                    observer?.disconnect();
                    observer = null;
                    void mountEmbla();
                    break;
                }
            },
            { threshold },
        );

        observer.observe(viewport);
    });

    onBeforeUnmount(() => {
        observer?.disconnect();
        observer = null;
        api.value?.destroy();
        api.value = null;
    });

    return { viewportRef, api };
}
