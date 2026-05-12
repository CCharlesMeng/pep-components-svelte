<script lang="ts">
    import { untrack } from "svelte";
    import type { Snippet } from "svelte";

    // ─────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────

    /** 事件回调中传递的轮播状态快照 */
    export interface CarouselEventState {
        /** 当前 slide 索引（loop 模式含克隆偏移） */
        currentIndex: number;
        /** 切换前的 currentIndex，首次为 undefined */
        oldIndex: number | undefined;
        /** 当前真实索引（loop 模式不含克隆） */
        realIndex: number;
        /** 切换前的 realIndex，首次为 undefined */
        oldRealIndex: number | undefined;
        /** slide 总数（loop 模式含克隆） */
        slideQuantity: number;
        /** 真实 slide 数量（不含克隆） */
        realQuantity: number;
    }

    interface AutoplayOptions {
        /** 播放间隔(ms)，默认 5000 */
        delay?: number;
        waitForTransition?: boolean;
    }

    interface Props {
        /** 过渡效果，默认 slide */
        transition?: "slide" | "fade";
        /** 布局模式：preview 使用等宽预览，free 允许调用方控制 slide 宽度 */
        layout?: "preview" | "free";
        /** 初始显示的 slide 索引，默认 0 */
        initialSlide?: number;
        /** 同时显示的滑块数量，默认 1 */
        preview?: number;
        /** 切换速度(ms)，默认 400 */
        speed?: number;
        /** 是否开启循环模式 */
        loop?: boolean;
        /** 是否开启自动播放 */
        autoplay?: boolean | AutoplayOptions;
        /** 是否显示分页圆点 */
        pagination?: boolean;
        /** 是否显示前进/后退按钮 */
        navigation?: boolean;
        /** 是否开启鼠标模拟触摸滑动 */
        simulateTouch?: boolean;
        /** 深色模式 */
        dark?: boolean;
        /** 额外 class */
        class?: string;
        /** 轮播内容（por-carousel-slide 元素） */
        children?: Snippet;

        // ── 生命周期事件 ──
        /** 初始化前 */
        onbeforeInit?: (state: CarouselEventState) => void;
        /** 初始化完成后 */
        oninit?: (state: CarouselEventState) => void;

        // ── slide 变化事件 ──
        /** 当前 slide 的真实索引发生变化时（过渡开始前触发） */
        onslideChange?: (state: CarouselEventState) => void;

        // ── 过渡事件 ──
        /** 过渡开始前 */
        onbeforeTransition?: (state: CarouselEventState) => void;
        /** 过渡开始后（动画已启动） */
        onbeginTransition?: (state: CarouselEventState) => void;
        /** 过渡结束 */
        ontransitioned?: (state: CarouselEventState) => void;

        // ── slide 切换过渡事件（仅 slide 发生变化时触发） ──
        /** slide 切换过渡开始前 */
        onbeforeSlideChangeTransition?: (state: CarouselEventState) => void;
        /** slide 切换过渡开始后 */
        onbeginSlideChangeTransition?: (state: CarouselEventState) => void;
        /** slide 切换过渡结束 */
        onslideChangeTransitioned?: (state: CarouselEventState) => void;
    }

    // ─────────────────────────────────────────────
    // Props
    // ─────────────────────────────────────────────
    let {
        transition: transType = "slide",
        layout = "preview",
        initialSlide = 0,
        preview: previewCount = 1,
        speed: transSpeed = 400,
        loop = false,
        autoplay = false,
        pagination = false,
        navigation = false,
        simulateTouch = false,
        dark = false,
        class: className = "",
        children,
        onbeforeInit,
        oninit,
        onslideChange,
        onbeforeTransition,
        onbeginTransition,
        ontransitioned,
        onbeforeSlideChangeTransition,
        onbeginSlideChangeTransition,
        onslideChangeTransitioned,
    }: Props = $props();

    const autoplayDelay = $derived(
        typeof autoplay === "object" ? (autoplay.delay ?? 5000) : 5000,
    );

    /** 与 theme-token.js 一致：waitForTransition 为 true 时在过渡结束后再间隔 delay */
    const autoplayWaitForTransition = $derived(
        typeof autoplay === "object" && autoplay.waitForTransition === true,
    );

    // ─────────────────────────────────────────────
    // DOM refs
    // ─────────────────────────────────────────────
    let carouselEl: HTMLElement | undefined = $state();
    let wrapperEl: HTMLElement | undefined = $state();

    /** html[lang=ar-MENA] 时与参考实现一致：前进/后退语义互换（与 jQuery 版读取方式一致） */
    const dir = $derived.by((): "ltr" | "rtl" => {
        if (typeof document === "undefined") return "ltr";
        return document.documentElement.getAttribute("lang") === "ar-MENA"
            ? "rtl"
            : "ltr";
    });

    // ─────────────────────────────────────────────
    // Core state
    // ─────────────────────────────────────────────
    let realSlides: HTMLElement[] = $state([]);    // 真实 slides（不含克隆）
    let currentIndex = $state(0);                  // 当前索引（loop 模式含克隆偏移）
    let oldIndex: number | undefined = $state(undefined); // 切换前的 currentIndex
    let realIndex = $state(0);                     // 当前真实索引（0 ~ realCount-1）
    let oldRealIndex: number | undefined = $state(undefined); // 切换前的 realIndex
    let isTransitioning = $state(false);
    let transitionTimer: ReturnType<typeof setTimeout> | null = null;
    let autoplayTimer: ReturnType<typeof setInterval> | null = null;
    let autoplayWaitTimeout: ReturnType<typeof setTimeout> | null = null;
    /** 与参考实现 playing 一致：pause() 后为 false，过渡结束不应再调度自动播放 */
    let autoplayPlaying = $state(false);
    let containerWidth = $state(0);
    /** free：轨道总长、逻辑视口宽、非 loop 下的「屏」阶梯（与 maxReachable / 分页一致） */
    let freeContentWidth = $state(0);
    let freeVisibleWidth = $state(0);
    let freeSnapSlideIndices = $state<number[]>([0]);
    let freeMaxSnapSlideIndex = $state(0);

    const realCount = $derived(realSlides.length);
    const isFreeLayout = $derived(layout === "free");

    /** 与 cnpm-baseui Carousel 一致：preview 取整且不超过真实 slide 数 */
    const previewNum = $derived.by(() => {
        const p = Math.round(previewCount);
        if (realCount === 0) return Math.max(1, p);
        return Math.min(Math.max(1, p), realCount);
    });

    /** free + loop 沿用单张切换语义，避免宽度自由时克隆数量依赖 preview。 */
    const activePreviewNum = $derived(isFreeLayout ? 1 : previewNum);
    const maxReachableIndex = $derived(
        realCount === 0
            ? 0
            : isFreeLayout
              ? loop
                  ? Math.max(0, realCount - 1)
                  : freeMaxSnapSlideIndex
              : Math.max(0, realCount - activePreviewNum),
    );

    const allCount = $derived(loop ? realCount + activePreviewNum * 2 : realCount);

    const freeActivePageIndex = $derived.by(() => {
        if (!isFreeLayout || loop || freeSnapSlideIndices.length === 0) return 0;
        for (let p = freeSnapSlideIndices.length - 1; p >= 0; p--) {
            if (freeSnapSlideIndices[p] <= currentIndex) return p;
        }
        return 0;
    });

    /** 与参考实现一致：LTR/RTL 下「上一页」「下一页」按钮的禁用边界不同 */
    const atPrevDisabled = $derived(
        !loop &&
            (dir === "ltr"
                ? currentIndex === 0
                : currentIndex >= maxReachableIndex),
    );
    const atNextDisabled = $derived(
        !loop &&
            (dir === "ltr"
                ? currentIndex >= maxReachableIndex
                : currentIndex === 0),
    );

    // ─────────────────────────────────────────────
    // 获取当前状态快照（用于事件回调）
    // ─────────────────────────────────────────────
    function getCarouselState(): CarouselEventState {
        return {
            currentIndex,
            oldIndex,
            realIndex,
            oldRealIndex,
            slideQuantity: wrapperEl
                ? wrapperEl.querySelectorAll(".por-carousel-slide").length
                : allCount,
            realQuantity: realCount,
        };
    }

    // ─────────────────────────────────────────────
    // 初始化：DOM ready 后读取 slides，建立循环克隆
    // ─────────────────────────────────────────────
    $effect(() => {
        if (!wrapperEl || !carouselEl) return;

        return untrack(() => {
            // ── beforeInit ──
            onbeforeInit?.(getCarouselState());

            // 读取真实 slides
            const els = Array.from(
                wrapperEl!.querySelectorAll<HTMLElement>(
                    ":scope > .por-carousel-slide:not(.por-carousel-slide-duplicate)",
                ),
            );
            realSlides = els;

            if (els.length === 0) {
                // 与有 slide 分支一致返回 teardown，避免出现「无 cleanup → 上一轮 autoplay / DOM 残留」边角
                return () => {
                    stopAutoplay();
                };
            }

            const pv = isFreeLayout
                ? 1
                : Math.min(Math.max(1, Math.round(previewCount)), els.length);

            containerWidth = carouselEl!.offsetWidth;

            // preview > 1：设置每个 slide 宽度
            if (!isFreeLayout && pv > 1) {
                const w = `${100 / pv}%`;
                els.forEach((s) => s.style.setProperty("width", w));
            }

            updateFreeLayoutMetrics();

            // loop 模式：前后各插入克隆
            if (loop) {
                for (let i = pv - 1; i >= 0; i--) {
                    const clone = els[((els.length - 1 - i) % els.length + els.length) % els.length]
                        .cloneNode(true) as HTMLElement;
                    clone.classList.add("por-carousel-slide-duplicate");
                    wrapperEl!.prepend(clone);
                }
                for (let i = 0; i < pv * 2 - 1; i++) {
                    const clone = els[i % els.length].cloneNode(true) as HTMLElement;
                    clone.classList.add("por-carousel-slide-duplicate");
                    wrapperEl!.appendChild(clone);
                }
            }

            // 跳至初始位置（fade：setFade 设 opacity；位移见 applyFadeSlideTransforms）
            const rawStartIdx = loop ? initialSlide + pv : initialSlide;
            const startIdx = !loop && isFreeLayout
                ? Math.min(Math.max(0, rawStartIdx), freeMaxSnapSlideIndex)
                : rawStartIdx;
            jumpTo(startIdx);
            if (transType === "fade") {
                applyFadeSlideTransforms();
            }

            // 启动自动播放
            if (autoplay) startAutoplay();

            // ── init ──
            oninit?.(getCarouselState());

            return () => {
                stopAutoplay();
                wrapperEl
                    ?.querySelectorAll(".por-carousel-slide-duplicate")
                    .forEach((el) => el.remove());
                realSlides.forEach((s) => {
                    if (!isFreeLayout && pv > 1) {
                        s.style.removeProperty("width");
                    }
                    s.style.opacity = "";
                    s.style.transform = "";
                });
            };
        });
    });

    // ─────────────────────────────────────────────
    // 响应式布局（仅浏览器：SSR 无 window / ResizeObserver）
    // ─────────────────────────────────────────────
    $effect(() => {
        if (!carouselEl || typeof window === "undefined") return;
        const el = carouselEl;
        // 仅订阅「何时重建监听」：DOM 与模式/过渡。测量与写 state 必须在 untrack 中，
        // 否则 onLayout 会把 containerWidth / currentIndex 等登记为本 effect 依赖 → 同步无限重跑 → 页面卡死白屏。
        void isFreeLayout;
        void transType;
        void loop;
        void previewCount;
        void navigation;
        void wrapperEl;
        void realCount;

        const onLayout = () => {
            untrack(() => {
                containerWidth = el.offsetWidth;
                updateFreeLayoutMetrics(true);
                // 切页动画进行中勿重置 transform：setTransform(0) 会把 transition 设为 none，
                // ResizeObserver/回流 若在此时触发 onLayout，会打断正在进行中的过渡，表现为滑动发涩、跳变。
                if (!isDragging && !isTransitioning) {
                    if (transType === "fade") {
                        applyFadeSlideTransforms();
                    } else {
                        setTransform(0);
                    }
                }
            });
        };
        onLayout();
        const ro = new ResizeObserver(onLayout);
        ro.observe(el);
        const trackForRo = el.querySelector<HTMLElement>(".por-carousel-free-track");
        if (trackForRo) ro.observe(trackForRo);
        if (wrapperEl) ro.observe(wrapperEl);
        window.addEventListener("resize", onLayout);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", onLayout);
        };
    });

    // ─────────────────────────────────────────────
    // 过渡：slide 模式
    // ─────────────────────────────────────────────
    function getTranslateX(index: number): number {
        if (isFreeLayout) {
            const off = getSlideOffset(index);
            if (loop) return -off;
            return -Math.min(off, freeNonLoopScrollMax());
        }
        const slideW = containerWidth / previewNum;
        return -slideW * index;
    }

    function setTransform(dur: number) {
        if (!wrapperEl || transType === "fade") return;
        const tx = getTranslateX(currentIndex);
        wrapperEl.style.transition = dur > 0 ? `transform ${dur}ms` : "none";
        wrapperEl.style.transform = `translate3d(${tx}px, 0, 0)`;
    }

    // ─────────────────────────────────────────────
    // 核心方法
    // ─────────────────────────────────────────────
    function getAllSlides(): HTMLElement[] {
        return Array.from(
            wrapperEl?.querySelectorAll<HTMLElement>(".por-carousel-slide") ?? [],
        );
    }

    function getSlideOffset(index: number): number {
        const slides = getAllSlides();
        if (slides.length === 0) return 0;
        const base = slides[0].offsetLeft;
        const target = slides[Math.max(0, Math.min(index, slides.length - 1))];
        return target ? target.offsetLeft - base : 0;
    }

    /** free 非 loop：最大横向滚动距离；loop / 非 free 为 Infinity（不按屏钳位） */
    function freeNonLoopScrollMax(): number {
        if (!isFreeLayout || loop) return Number.POSITIVE_INFINITY;
        return Math.max(0, freeContentWidth - freeVisibleWidth);
    }

    /** 按 min(offset,maxT) 的阶梯收集「屏」起点 slide 下标 */
    function buildFreeSnapSlideIndices(
        slides: HTMLElement[],
        baseLeft: number,
        maxT: number,
    ): number[] {
        if (maxT <= 0) return [0];
        const snaps: number[] = [];
        let prevClamped = -Infinity;
        for (let i = 0; i < slides.length; i++) {
            const c = Math.min(slides[i].offsetLeft - baseLeft, maxT);
            if (i === 0 || c > prevClamped + 0.5) {
                snaps.push(i);
                prevClamped = c;
            }
        }
        return snaps.length > 0 ? snaps : [0];
    }

    /**
     * 华为云首页 initSpace 同级：视口内容区宽（断点与 1600 居中列一致）。
     * SSR：无 window 时用根节点 clientWidth，避免布局与 max 计算抛错。
     */
    function getFreeVisibleWidth(): number {
        if (typeof window === "undefined") {
            return carouselEl?.clientWidth ?? 0;
        }
        const vw = window.innerWidth;
        let contentW: number;
        if (vw > 1776) {
            contentW = 1600;
        } else if (vw > 1024) {
            contentW = vw - 2 * (0.05 * vw);
        } else if (vw > 768) {
            contentW = vw - 2 * (0.03 * vw);
        } else {
            contentW = window.innerWidth - 48;
        }
        contentW = Math.max(0, contentW);
        if (carouselEl && carouselEl.clientWidth > 0) {
            contentW = Math.min(contentW, carouselEl.clientWidth);
        }
        return contentW;
    }

    function updateFreeLayoutMetrics(clampCurrent = false) {
        if (!isFreeLayout || !carouselEl) return;

        if (realSlides.length === 0) {
            freeContentWidth = 0;
            freeVisibleWidth = getFreeVisibleWidth();
            freeSnapSlideIndices = [0];
            freeMaxSnapSlideIndex = 0;
            return;
        }

        freeVisibleWidth = getFreeVisibleWidth();
        const base = realSlides[0].offsetLeft;
        const last = realSlides[realSlides.length - 1];
        freeContentWidth = last.offsetLeft - base + last.offsetWidth;

        if (loop) {
            freeSnapSlideIndices = [];
            freeMaxSnapSlideIndex = Math.max(0, realSlides.length - 1);
        } else {
            const maxT = Math.max(0, freeContentWidth - freeVisibleWidth);
            freeSnapSlideIndices = buildFreeSnapSlideIndices(realSlides, base, maxT);
            freeMaxSnapSlideIndex = freeSnapSlideIndices[freeSnapSlideIndices.length - 1] ?? 0;
            if (clampCurrent && currentIndex > freeMaxSnapSlideIndex) {
                jumpTo(freeMaxSnapSlideIndex);
            }
        }
    }

    function getClosestIndexByTranslate(tx: number): number {
        const slides = getAllSlides();
        if (slides.length === 0) return currentIndex;
        const maxSnap = freeNonLoopScrollMax();
        const base = slides[0].offsetLeft;
        let closestIndex = 0;
        let closestDistance = Infinity;
        slides.forEach((slide, i) => {
            const offset = slide.offsetLeft - base;
            const snapped = Math.min(offset, maxSnap);
            const distance = Math.abs(snapped + tx);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        });
        return closestIndex;
    }

    /** 分页圆点目标 slide 下标；free 非 loop 映射各「屏」起点 */
    function paginationSlideTarget(pageIdx: number): number {
        return isFreeLayout && !loop ? (freeSnapSlideIndices[pageIdx] ?? pageIdx) : pageIdx;
    }

    // ─────────────────────────────────────────────
    // 过渡：fade 模式（对齐 theme-token.js fade.setTranslate：每页位移 + 仅 opacity 过渡）
    // ─────────────────────────────────────────────
    function setFade(activeIdx: number, dur: number) {
        const slides = getAllSlides();
        slides.forEach((s, i) => {
            s.style.transition = dur > 0 ? `opacity ${dur}ms` : "none";
            s.style.opacity = i === activeIdx ? "1" : "0";
        });
    }

    /**
     * jQuery 版：factor 为 ltr ? -1 : 1，offset = factor * carouselWidth * slideIndex
     * transform 在 resize / 初始化 / appendSlide 后更新；切换页只改 opacity。
     */
    function applyFadeSlideTransforms() {
        if (!carouselEl || transType !== "fade") return;
        const w = carouselEl.offsetWidth;
        if (w <= 0) return;
        const factor = dir === "ltr" ? -1 : 1;
        const slides = getAllSlides();
        slides.forEach((s, i) => {
            const offset = factor * w * i;
            s.style.transform = `translate3d(${offset}px, 0, 0)`;
        });
    }

    function updateActiveClasses(idx: number) {
        const slides = getAllSlides();
        slides.forEach((s, i) => {
            s.classList.remove(
                "por-carousel-slide-current",
                "por-carousel-slide-prev",
                "por-carousel-slide-next",
            );
            if (i === idx) s.classList.add("por-carousel-slide-current");
            else if (i === idx - 1) s.classList.add("por-carousel-slide-prev");
            else if (i === idx + 1) s.classList.add("por-carousel-slide-next");
        });
    }

    function syncRealIndex(idx: number) {
        realIndex = loop ? (idx - activePreviewNum + realCount) % realCount : idx;
    }

    /** 无动画跳转（不触发事件） */
    function jumpTo(idx: number) {
        currentIndex = idx;
        syncRealIndex(idx);
        if (transType === "fade") {
            setFade(idx, 0);
        } else {
            setTransform(0);
        }
        updateActiveClasses(idx);
    }

    /**
     * 带动画过渡
     *
     * 与 theme-token.js `_transitionTo` 一致：
     *   _setProgressByIndex → _setIndex（可能 trigger slideChange）
     *   → _updateClasses（若 changed）
     *   → beforeTransition → beforeSlideChangeTransition（若 changed）
     *   → transitioning=true → _setTranslateAndTransition
     *   → beginTransition → beginSlideChangeTransition（若 changed）
     *   → transitionend / speed===0 → transitioned → slideChangeTransitioned
     *
     * jQuery 在 `slideChange.por.carousel.play` 里 pause+play：在 **slideChange 时**（过渡刚开始）
     * 重置 setInterval，而非 transition 结束后。waitForTransition 为 true 时参考 bundle 未建 interval，
     * 本组件在过渡结束后 scheduleAutoplayDelay 以对齐「间隔在动画之后」的语义。
     */
    function transitionTo(idx: number, dur?: number): boolean {
        const speed = dur ?? transSpeed;
        if (isTransitioning) return false;
        if (!loop && (idx < 0 || idx > maxReachableIndex)) return false;
        if (idx === currentIndex) return false;

        const changed = idx !== currentIndex;

        // 记录旧 currentIndex
        if (changed) {
            oldIndex = currentIndex;
        }

        isTransitioning = true;
        currentIndex = idx;

        // 同步 realIndex，并在真实索引变化时触发 slideChange
        const prevRealIndex = realIndex;
        syncRealIndex(idx);
        if (realIndex !== prevRealIndex) {
            oldRealIndex = prevRealIndex;
            onslideChange?.(getCarouselState());
            // 与 jQuery `slideChange.por.carousel.play` → pause+play 一致：非 waitForTransition 时在
            // slideChange 时刻重开 interval，而非 transitioned 之后。
            if (autoplayPlaying && !autoplayWaitForTransition) {
                restartAutoplay();
            }
        }

        // 与 _updateClasses 一致：在 slideChange 之后、beforeTransition 之前
        updateActiveClasses(idx);

        // ── beforeTransition ──
        onbeforeTransition?.(getCarouselState());
        if (changed) onbeforeSlideChangeTransition?.(getCarouselState());

        const onTransitionDone = () => {
            transitionTimer = null;
            if (loop && transType !== "fade") {
                if (currentIndex < activePreviewNum) {
                    jumpTo(realCount + currentIndex);
                } else if (currentIndex >= realCount + activePreviewNum) {
                    jumpTo(currentIndex - realCount);
                }
            }
            isTransitioning = false;

            // ── transitioned ──
            ontransitioned?.(getCarouselState());
            if (changed) onslideChangeTransitioned?.(getCarouselState());

            if (changed && autoplayPlaying && autoplayWaitForTransition) {
                scheduleAutoplayDelay();
            }
        };

        if (transType === "fade") {
            setFade(idx, speed);

            // ── beginTransition（动画已启动后触发）──
            onbeginTransition?.(getCarouselState());
            if (changed) onbeginSlideChangeTransition?.(getCarouselState());

            if (speed === 0) {
                onTransitionDone();
            } else {
                const slides = getAllSlides();
                let triggered = false;
                const handler = () => {
                    if (triggered) return;
                    triggered = true;
                    slides.forEach((s) => s.removeEventListener("transitionend", handler));
                    onTransitionDone();
                };
                slides.forEach((s) => s.addEventListener("transitionend", handler));
                transitionTimer = setTimeout(() => {
                    if (!triggered) { triggered = true; onTransitionDone(); }
                }, speed + 50);
            }
        } else {
            setTransform(speed);

            // ── beginTransition（动画已启动后触发）──
            onbeginTransition?.(getCarouselState());
            if (changed) onbeginSlideChangeTransition?.(getCarouselState());

            if (speed === 0) {
                onTransitionDone();
            } else {
                let triggered = false;
                const handler = (ev: TransitionEvent) => {
                    if (ev.target !== wrapperEl) return;
                    triggered = true;
                    wrapperEl!.removeEventListener("transitionend", handler);
                    onTransitionDone();
                };
                wrapperEl!.addEventListener("transitionend", handler);
                // 兜底 setTimeout，防止 transitionend 不触发
                transitionTimer = setTimeout(() => {
                    if (!triggered) {
                        wrapperEl?.removeEventListener("transitionend", handler);
                        onTransitionDone();
                    }
                }, speed + 50);
            }
        }
        return true;
    }

    // ─────────────────────────────────────────────
    // 公共导航方法（可通过 bind:this 调用）
    // ─────────────────────────────────────────────
    /** LTR 下「上一项」；与 cnpm-baseui 中 prev() 在非 RTL 时语义一致 */
    function corePrev(): boolean {
        if (atPrevDisabled) return false;
        if (loop && currentIndex < activePreviewNum) {
            jumpTo(realCount + activePreviewNum - 1);
            requestAnimationFrame(() => transitionTo(currentIndex - 1));
            return true;
        }
        return transitionTo(currentIndex - 1);
    }

    /** LTR 下「下一项」 */
    function coreNext(): boolean {
        if (atNextDisabled) return false;
        if (loop && currentIndex >= realCount + activePreviewNum) {
            jumpTo(activePreviewNum);
            requestAnimationFrame(() => transitionTo(currentIndex + 1));
            return true;
        }
        return transitionTo(currentIndex + 1);
    }

    /** 参考实现：RTL 时 data-prev 走 next、data-next 走 prev */
    export function prev(): boolean {
        return dir === "rtl" ? coreNext() : corePrev();
    }

    export function next(): boolean {
        return dir === "rtl" ? corePrev() : coreNext();
    }

    /** 与 slideTo(index, speed) 一致；index 为目标真实下标（loop 时内部加 preview 偏移） */
    export function slideTo(index: number, dur?: number): boolean {
        const target = loop ? index + activePreviewNum : index;
        if (target === currentIndex) return false;
        if (dur === 0) {
            jumpTo(target);
            return true;
        }
        return transitionTo(target, dur);
    }

    export function slideToLoop(ri: number, dur?: number): boolean {
        return slideTo(ri, dur);
    }

    export function play() {
        startAutoplay();
    }

    export function pause() {
        stopAutoplay();
    }

    /** 获取当前实例状态（可通过 bind:this 调用后读取） */
    export function getState(): CarouselEventState {
        return getCarouselState();
    }

    /**
     * 追加新的 slide 到轮播结尾
     *
     * @param slides 可以是单个 HTMLElement / HTML 字符串，或它们组成的数组
     *
     * @example
     * carousel.appendSlide('<div class="por-carousel-slide">new</div>');
     * carousel.appendSlide([slide1, slide2]);
     */
    export function appendSlide(
        slides: HTMLElement | HTMLElement[] | string | string[],
    ) {
        if (!wrapperEl) return;

        // 先移除 loop 克隆，避免干扰 DOM 结构
        if (loop) {
            wrapperEl
                .querySelectorAll(".por-carousel-slide-duplicate")
                .forEach((el) => el.remove());
        }

        // 追加新 slides
        const slideArr = Array.isArray(slides) ? slides : [slides];
        slideArr.forEach((slide) => {
            if (typeof slide === "string") {
                const temp = document.createElement("div");
                temp.innerHTML = slide;
                Array.from(temp.children).forEach((el) =>
                    wrapperEl!.appendChild(el),
                );
            } else {
                wrapperEl!.appendChild(slide as HTMLElement);
            }
        });

        // 重新读取真实 slides
        const els = Array.from(
            wrapperEl.querySelectorAll<HTMLElement>(
                ":scope > .por-carousel-slide:not(.por-carousel-slide-duplicate)",
            ),
        );
        realSlides = els;

        // 重置宽度
        if (!isFreeLayout && previewNum > 1) {
            const w = `${100 / previewNum}%`;
            els.forEach((s) => s.style.setProperty("width", w));
        }

        updateFreeLayoutMetrics();

        // 重建 loop 克隆
        // 注意：轮播图克隆管理必须直接操作 DOM，Svelte 模板无法描述此动态克隆逻辑
        if (loop) {
            for (let i = activePreviewNum - 1; i >= 0; i--) {
                const clone = els[
                    ((els.length - 1 - i) % els.length + els.length) % els.length
                ].cloneNode(true) as HTMLElement;
                clone.classList.add("por-carousel-slide-duplicate");
                // eslint-disable-next-line svelte/no-dom-manipulation
                wrapperEl.prepend(clone);
            }
            for (let i = 0; i < activePreviewNum * 2 - 1; i++) {
                const clone = els[i % els.length].cloneNode(true) as HTMLElement;
                clone.classList.add("por-carousel-slide-duplicate");
                // eslint-disable-next-line svelte/no-dom-manipulation
                wrapperEl.appendChild(clone);
            }
        }

        // 跳回当前 realIndex（不触发事件）
        const rawTarget = loop ? realIndex + activePreviewNum : realIndex;
        const target = !loop && isFreeLayout
            ? Math.min(Math.max(0, rawTarget), freeMaxSnapSlideIndex)
            : rawTarget;
        jumpTo(target);
        if (transType === "fade") {
            applyFadeSlideTransforms();
        }
    }

    /**
     * 销毁轮播图实例（停止自动播放、移除克隆、重置样式）
     * 注意：组件本身不会从 DOM 移除，若需完全卸载请销毁父组件
     */
    export function destroy() {
        stopAutoplay();

        if (transitionTimer !== null) {
            clearTimeout(transitionTimer);
            transitionTimer = null;
        }
        isTransitioning = false;

        // 移除 loop 克隆
        wrapperEl
            ?.querySelectorAll(".por-carousel-slide-duplicate")
            .forEach((el) => el.remove());

        realSlides.forEach((s) => {
            if (!isFreeLayout && previewNum > 1) {
                s.style.removeProperty("width");
            }
            s.style.opacity = "";
            s.style.transform = "";
        });

        if (wrapperEl) {
            wrapperEl.style.transition = "none";
            wrapperEl.style.transform = "";
        }

    }

    // ─────────────────────────────────────────────
    // 自动播放
    // ─────────────────────────────────────────────
    function clearAutoplayTimers() {
        if (autoplayTimer !== null) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
        if (autoplayWaitTimeout !== null) {
            clearTimeout(autoplayWaitTimeout);
            autoplayWaitTimeout = null;
        }
    }

    function autoplayTick() {
        // 与 cnpm-baseui theme-token.js 一致：非 loop 播完最后一屏后 slideTo(0)（默认 speed），
        // 走 transitionTo → 触发 onslideChange。勿用 slideTo(0,0)：那会 jumpTo，不触发 slideChange。
        if (!loop && currentIndex >= maxReachableIndex) {
            slideTo(0);
            if (autoplayPlaying && autoplayWaitForTransition) {
                scheduleAutoplayDelay();
            }
        } else {
            next();
        }
    }

    /** waitForTransition：在间隔 delay 后触发下一次切换（过渡结束后再计时的语义） */
    function scheduleAutoplayDelay() {
        if (autoplayWaitTimeout !== null) {
            clearTimeout(autoplayWaitTimeout);
            autoplayWaitTimeout = null;
        }
        autoplayWaitTimeout = setTimeout(() => {
            autoplayWaitTimeout = null;
            autoplayTick();
        }, autoplayDelay);
    }

    /** 与参考 play() 一致：不依赖 props.autoplay，可由外部 pause()/play() 控制 */
    function startAutoplay() {
        clearAutoplayTimers();
        autoplayPlaying = true;
        if (autoplayWaitForTransition) {
            scheduleAutoplayDelay();
        } else {
            autoplayTimer = setInterval(autoplayTick, autoplayDelay);
        }
    }

    function restartAutoplay() {
        if (!autoplayPlaying) return;
        clearAutoplayTimers();
        if (autoplayWaitForTransition) {
            scheduleAutoplayDelay();
        } else {
            autoplayTimer = setInterval(autoplayTick, autoplayDelay);
        }
    }

    function stopAutoplay() {
        autoplayPlaying = false;
        clearAutoplayTimers();
    }

    /** 中断正在进行的过渡，返回 wrapper 当前实际的 translateX */
    function interruptTransition(): number {
        if (transitionTimer !== null) {
            clearTimeout(transitionTimer);
            transitionTimer = null;
        }
        isTransitioning = false;

        if (wrapperEl) {
            const matrix = new DOMMatrix(getComputedStyle(wrapperEl).transform);
            wrapperEl.style.transition = "none";
            wrapperEl.style.transform = `translate3d(${matrix.m41}px, 0, 0)`;

            if (isFreeLayout) {
                const idx = getClosestIndexByTranslate(matrix.m41);
                const upper = loop ? allCount - activePreviewNum : maxReachableIndex;
                const clamped = Math.max(0, Math.min(idx, upper));
                currentIndex = clamped;
                syncRealIndex(clamped);
            } else {
                const slideW = containerWidth / previewNum;
                if (slideW > 0) {
                    const idx = Math.round(-matrix.m41 / slideW);
                    const clamped = Math.max(0, Math.min(idx, allCount - previewNum));
                    currentIndex = clamped;
                    syncRealIndex(clamped);
                }
            }
            return matrix.m41;
        }
        return getTranslateX(currentIndex);
    }

    // ─────────────────────────────────────────────
    // Touch / Pointer 事件（跨设备统一）
    // ─────────────────────────────────────────────
    let ptrStartX = 0;
    let ptrStartY = 0;
    let ptrLastX = 0;
    let ptrLastY = 0;
    let isDragging = false;
    let isScrolling = false;
    let dragStartTranslate = 0;
    let wasPlayingBeforeDrag = false;
    /**
     * 是否处于「已被 onPointerDown 接受」的指针会话。
     *
     * 修复 free 非 loop 模式偶现跳变：点击 prev/next/bullet 按钮时，onPointerDown 因命中按钮而早返回，
     * 但 ptrStartX/Y、dragStartTranslate 等指针交互状态保留旧值（或 0）。若按下→抬起之间出现 pointermove
     * （鼠标轻微移动即可触发），旧逻辑会以 stale ptrStartX 计算出巨大 dx，把 wrapper 推到屏幕外，
     * 随后 click 触发的 transitionTo 再缓动回目标位置——视觉上就是「首张卡片瞬间到最右，再滑到目标」。
     *
     * 仅当 onPointerDown 真正接受会话时置 true；任意 pointerup/cancel 复位为 false。
     */
    let isPointerActive = false;

    // 速度检测：追踪最近 5 个坐标点
    const COORS_MAX_LENGTH = 5;
    const TRIGGER_SPEED = 0.2; // px/ms
    const RESISTANCE_RATIO = 0.5;
    let moveCoors: { x: number; time: number }[] = [];

    function getMoveXSpeed(): number {
        if (moveCoors.length < 2) return 0;
        const duration = moveCoors[moveCoors.length - 1].time - moveCoors[0].time;
        const offset = moveCoors[moveCoors.length - 1].x - moveCoors[0].x;
        return duration > 0 ? offset / duration : 0;
    }

    function addCoors(pageX: number) {
        moveCoors.push({ x: pageX, time: Date.now() });
        if (moveCoors.length > COORS_MAX_LENGTH) moveCoors.shift();
    }

    function shouldHandlePointer(e: PointerEvent): boolean {
        return e.pointerType === "touch" || simulateTouch;
    }

    function endDrag() {
        if (!isDragging) return;
        const totalDx = ptrLastX - ptrStartX;
        const endSpeed = getMoveXSpeed();
        let isSpeedValid =
            totalDx !== 0 &&
            totalDx * endSpeed > 0 &&
            Math.abs(endSpeed) > TRIGGER_SPEED;
        if (dir === "rtl") {
            isSpeedValid =
                totalDx !== 0 &&
                totalDx * endSpeed < 0 &&
                Math.abs(endSpeed) > TRIGGER_SPEED;
        }
        const threshold = containerWidth * 0.2;

        if (isFreeLayout && transType !== "fade" && wrapperEl) {
            const matrix = new DOMMatrix(getComputedStyle(wrapperEl).transform);
            let targetIdx = getClosestIndexByTranslate(matrix.m41);
            if (isSpeedValid && targetIdx === currentIndex) {
                const step =
                    dir === "rtl"
                        ? (totalDx > 0 ? 1 : -1)
                        : (totalDx > 0 ? -1 : 1);
                targetIdx += step;
            }
            if (!loop) {
                targetIdx = Math.max(0, Math.min(targetIdx, maxReachableIndex));
            }
            if (!transitionTo(targetIdx)) setTransform(transSpeed);
        } else if (isSpeedValid || Math.abs(totalDx) > threshold) {
            totalDx > 0 ? prev() : next();
        } else {
            setTransform(transSpeed);
        }
        isDragging = false;
        isScrolling = false;
        if (wasPlayingBeforeDrag) startAutoplay();
    }

    function onPointerDown(e: PointerEvent) {
        if (!shouldHandlePointer(e)) return;

        if (e.pointerType !== "touch") {
            const t = e.target as HTMLElement;
            if (t.closest(".por-carousel-prev, .por-carousel-next, .por-carousel-bullet, .por-carousel-pagination")) {
                // 命中导航按钮：不开启拖拽会话；显式置 false 以避免后续 pointermove 用旧 ptrStart* 误判为拖动。
                isPointerActive = false;
                return;
            }
        }

        isPointerActive = true;
        ptrStartX = e.clientX;
        ptrStartY = e.clientY;
        ptrLastX = e.clientX;
        ptrLastY = e.clientY;
        isDragging = false;
        isScrolling = false;
        moveCoors = [];

        if (isTransitioning) {
            dragStartTranslate = interruptTransition();
        } else {
            dragStartTranslate = getTranslateX(currentIndex);
        }

        wasPlayingBeforeDrag = false;

        if (e.pointerType === "touch") {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e: PointerEvent) {
        // 必须先校验：只处理已被 onPointerDown 接受的会话，避免按钮 click 误入拖动分支。
        if (!isPointerActive) return;
        if (!shouldHandlePointer(e) || isScrolling) return;
        if (e.pointerType !== "touch" && e.buttons === 0) {
            // 鼠标按键已松开却仍来到这里：说明 pointerup 在 carousel 之外被吞，主动结束会话。
            isPointerActive = false;
            return;
        }

        if (e.clientX === ptrLastX && e.clientY === ptrLastY) return;

        addCoors(e.clientX);

        const dx = e.clientX - ptrStartX;
        const dy = e.clientY - ptrStartY;

        if (!isDragging && Math.abs(dy) > Math.abs(dx)) {
            isScrolling = true;
            return;
        }

        if (e.cancelable) e.preventDefault();

        if (!isDragging) {
            wasPlayingBeforeDrag = autoplayPlaying;
            if (autoplay) stopAutoplay();
        }
        isDragging = true;
        ptrLastX = e.clientX;
        ptrLastY = e.clientY;

        if (transType !== "fade" && wrapperEl) {
            // loop 模式拖拽中边界跳转
            if (loop) {
                const currentTx = dragStartTranslate + dx;
                const slideW = containerWidth / previewNum;
                const inferIdx = isFreeLayout
                    ? getClosestIndexByTranslate(currentTx)
                    : (slideW > 0 ? Math.round(-currentTx / slideW) : currentIndex);
                if (inferIdx < activePreviewNum || inferIdx >= realCount + activePreviewNum) {
                    const targetIdx = (inferIdx - activePreviewNum + realCount) % realCount + activePreviewNum;
                    const jumpTx = getTranslateX(targetIdx);
                    dragStartTranslate = jumpTx - dx;
                    currentIndex = targetIdx;
                    syncRealIndex(targetIdx);
                }
            }

            let tx = dragStartTranslate + dx;

            // 非 loop 边界阻力
            if (!loop) {
                const minTx = getTranslateX(maxReachableIndex);
                const maxTx = 0;
                if (tx > maxTx) {
                    tx = maxTx + (tx - maxTx) * RESISTANCE_RATIO;
                } else if (tx < minTx) {
                    tx = minTx + (tx - minTx) * RESISTANCE_RATIO;
                }
            }

            wrapperEl.style.transition = "none";
            wrapperEl.style.transform = `translate3d(${tx}px, 0, 0)`;
        }
    }

    function onPointerUp(e: PointerEvent) {
        if (!shouldHandlePointer(e)) return;
        // 无论本轮是否产生拖动，都必须结束指针会话，否则下一轮 pointermove 会用过期 ptrStart*。
        isPointerActive = false;
        if (!isDragging) return;
        endDrag();
    }

    // 鼠标 simulateTouch：在 document 监听 pointerup
    $effect(() => {
        if (!simulateTouch) return;

        function onDocPointerUp(e: PointerEvent) {
            if (e.pointerType === "touch") return;
            isPointerActive = false;
            endDrag();
        }

        document.addEventListener("pointerup", onDocPointerUp);
        return () => document.removeEventListener("pointerup", onDocPointerUp);
    });

    // ─────────────────────────────────────────────
    // 分页圆点
    // ─────────────────────────────────────────────
    const paginationCount = $derived(
        realCount === 0
            ? 0
            : loop
              ? realCount
              : isFreeLayout
                ? freeSnapSlideIndices.length
                : Math.max(0, maxReachableIndex + 1),
    );
    const paginationItems = $derived(
        Array.from({ length: paginationCount }, (_, i) => i),
    );
</script>

<!-- ─────────────────────────────── -->
<!-- Template                        -->
<!-- ─────────────────────────────── -->
<div
    class={[
        "por-carousel",
        transType === "fade" ? "por-carousel-fade" : "",
        isFreeLayout ? "por-carousel-free" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ")}
    data-bg={dark ? "dark" : undefined}
    role="region"
    aria-label="轮播图"
    bind:this={carouselEl}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    ondragstart={(e) => e.preventDefault()}
>
    {#if isFreeLayout}
        <div class="por-carousel-free-track">
            <div class="por-carousel-wrapper" bind:this={wrapperEl}>
                {@render children?.()}
            </div>
        </div>
    {:else}
        <div class="por-carousel-wrapper" bind:this={wrapperEl}>
            {@render children?.()}
        </div>
    {/if}

    <!-- 分页圆点 -->
    {#if pagination}
        <div class="por-carousel-pagination" data-pagination="carousel">
            {#each paginationItems as pageIdx (pageIdx)}
                <div
                    class="por-carousel-bullet"
                    class:active={isFreeLayout && !loop ? freeActivePageIndex === pageIdx : realIndex === pageIdx}
                    role="button"
                    tabindex="0"
                    aria-label="第 {pageIdx + 1} 页"
                    onclick={() => slideTo(paginationSlideTarget(pageIdx))}
                    onkeydown={(e) =>
                        e.key === "Enter" && slideTo(paginationSlideTarget(pageIdx))}
                ></div>
            {/each}
        </div>
    {/if}

    <!-- 前进/后退按钮 -->
    {#if navigation}
        {#if !isFreeLayout || !atPrevDisabled}
            <div
                class="por-carousel-prev"
                data-prev="carousel"
                class:disabled={atPrevDisabled}
                role="button"
                tabindex="0"
                aria-label="上一页"
                onclick={prev}
                onkeydown={(e) => e.key === "Enter" && prev()}
            ></div>
        {/if}
        {#if !isFreeLayout || !atNextDisabled}
            <div
                class="por-carousel-next"
                data-next="carousel"
                class:disabled={atNextDisabled}
                role="button"
                tabindex="0"
                aria-label="下一页"
                onclick={next}
                onkeydown={(e) => e.key === "Enter" && next()}
            ></div>
        {/if}
    {/if}
</div>

<style>
    /*
     * theme-token：根为 display:flex 横向，wrapper 带 transform 会压住同层后面的分页/箭头。
     * free：纵排 + 轨道层 z-index；导航用 absolute + inset-inline !important，避免业务样式改 position 后跑偏。
     */
    :global(.por-carousel.por-carousel-free) {
        overflow: visible;
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        /* 避免 100vw 含纵向滚动条时比父级更宽，absolute 箭头被裁 */
        max-width: 100%;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-free-track) {
        overflow: visible;
        width: 100%;
        min-width: 0;
        position: relative;
        z-index: 0;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-wrapper) {
        display: flex;
        gap: var(--por-carousel-slide-gap, 0px);
        z-index: 0;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-slide) {
        flex: 0 0 auto;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-pagination) {
        position: absolute !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 4;
        /* 不参与 flex 占高：根盒子高度≈轨道，箭头 top:50% 对准幻灯片纵向中心 */
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
        pointer-events: auto !important;
    }

    /*
     * prev/next：相对 .por-carousel-free 含块高度纯 CSS 垂直居中（固定 64px 命中区 → top: 50% − 半高），
     * 不用 JS、不用 transform，避免与 CDN / 子层 transform 叠出位移错误。
     */
    :global(.por-carousel.por-carousel-free .por-carousel-prev),
    :global(.por-carousel.por-carousel-free .por-carousel-next) {
        z-index: 5;
        position: absolute !important;
        /* 64px 命中区，与注释一致：纵向居中且不依赖 transform */
        top: calc(50% - 32px) !important;
        pointer-events: auto;
        margin: 0 !important;
        width: 64px !important;
        height: 64px !important;
        min-width: 64px !important;
        min-height: 64px !important;
        box-sizing: border-box !important;
        background: transparent none no-repeat !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        transition-property: opacity, color, background-color !important;
        transition-duration: 0.2s !important;
        transition-timing-function: ease !important;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-prev)::after,
    :global(.por-carousel.por-carousel-free .por-carousel-next)::after {
        content: none !important;
        display: none !important;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-prev)::before,
    :global(.por-carousel.por-carousel-free .por-carousel-next)::before {
        content: "" !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        font-family: initial !important;
        font-size: initial !important;
        box-sizing: border-box;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: contain !important;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-prev)::before {
        background-image: url("./last.svg") !important;
        transform: none !important;
    }

    /* 与 prev 同一张 SVG，只在伪元素上水平翻转，避免双资源渲染/亚像素差导致左右不齐 */
    :global(.por-carousel.por-carousel-free .por-carousel-next)::before {
        background-image: url("./last.svg") !important;
        transform: scaleX(-1) !important;
    }

    /* LTR：箭头外缘距容器左/右各 40px（物理 left/right，避免与遗漏 position 时 inset 失效） */
    :global(.por-carousel.por-carousel-free .por-carousel-prev) {
        left: 40px !important;
        right: auto !important;
    }

    :global(.por-carousel.por-carousel-free .por-carousel-next) {
        right: 40px !important;
        left: auto !important;
    }

    /* ar-MENA：与历史 jQuery 版一致 — prev 靠右、next 靠左 */
    :global(html[lang="ar-MENA"] .por-carousel.por-carousel-free .por-carousel-prev) {
        left: auto !important;
        right: 40px !important;
    }

    :global(html[lang="ar-MENA"] .por-carousel.por-carousel-free .por-carousel-next) {
        right: auto !important;
        left: 40px !important;
    }

    /* free：≤768（与布局断点 vw > 768 一致）隐藏左右箭头，保留分页 dots 与触控/模拟滑动 */
    @media (max-width: 768px) {
        :global(.por-carousel.por-carousel-free .por-carousel-prev),
        :global(.por-carousel.por-carousel-free .por-carousel-next) {
            display: none !important;
        }
    }
</style>
