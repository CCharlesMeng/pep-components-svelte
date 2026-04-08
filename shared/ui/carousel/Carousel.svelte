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

    // ─────────────────────────────────────────────
    // DOM refs
    // ─────────────────────────────────────────────
    let carouselEl: HTMLElement | undefined = $state();
    let wrapperEl: HTMLElement | undefined = $state();

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
    let containerWidth = $state(0);

    const realCount = $derived(realSlides.length);
    const allCount = $derived(loop ? realCount + previewCount * 2 : realCount);

    // 非 loop 模式下不可再前进/后退的边界
    const atStart = $derived(!loop && currentIndex === 0);
    const atEnd = $derived(!loop && currentIndex >= realCount - previewCount);

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

            if (els.length === 0) return;

            containerWidth = carouselEl!.offsetWidth;

            // preview > 1：设置每个 slide 宽度
            if (previewCount > 1) {
                els.forEach((s) => (s.style.width = `${100 / previewCount}%`));
            }

            // loop 模式：前后各插入克隆
            if (loop) {
                for (let i = previewCount - 1; i >= 0; i--) {
                    const clone = els[((els.length - 1 - i) % els.length + els.length) % els.length]
                        .cloneNode(true) as HTMLElement;
                    clone.classList.add("por-carousel-slide-duplicate");
                    wrapperEl!.prepend(clone);
                }
                for (let i = 0; i < previewCount * 2 - 1; i++) {
                    const clone = els[i % els.length].cloneNode(true) as HTMLElement;
                    clone.classList.add("por-carousel-slide-duplicate");
                    wrapperEl!.appendChild(clone);
                }
            }

            // fade 模式：设置初始绝对定位
            if (transType === "fade") {
                initFade();
            }

            // 跳至初始位置
            const startIdx = loop ? initialSlide + previewCount : initialSlide;
            jumpTo(startIdx);

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
                    s.style.opacity = "";
                    s.style.position = "";
                    s.style.left = "";
                    s.style.top = "";
                    s.style.width = "";
                });
                if (wrapperEl) {
                    wrapperEl.style.height = "";
                    wrapperEl.style.position = "";
                }
            };
        });
    });

    // ─────────────────────────────────────────────
    // 响应式布局：容器宽度变化时重算位置
    // ─────────────────────────────────────────────
    $effect(() => {
        if (!carouselEl) return;
        const ro = new ResizeObserver(() => {
            containerWidth = carouselEl!.offsetWidth;
            if (!isDragging) setTransform(0);
        });
        ro.observe(carouselEl);
        return () => ro.disconnect();
    });

    // ─────────────────────────────────────────────
    // 过渡：slide 模式
    // ─────────────────────────────────────────────
    function getTranslateX(index: number): number {
        const slideW = containerWidth / previewCount;
        return -slideW * index;
    }

    function setTransform(dur: number) {
        if (!wrapperEl || transType === "fade") return;
        const tx = getTranslateX(currentIndex);
        wrapperEl.style.transition = dur > 0 ? `transform ${dur}ms` : "none";
        wrapperEl.style.transform = `translate3d(${tx}px, 0, 0)`;
    }

    // ─────────────────────────────────────────────
    // 过渡：fade 模式
    // ─────────────────────────────────────────────
    function initFade() {
        if (!wrapperEl) return;
        const slides = getAllSlides();
        const firstH = slides[0]?.offsetHeight ?? 0;
        slides.forEach((s, i) => {
            s.style.position = "absolute";
            s.style.left = "0";
            s.style.top = "0";
            s.style.width = "100%";
            s.style.opacity = i === 0 ? "1" : "0";
        });
        wrapperEl.style.position = "relative";
        wrapperEl.style.height = `${firstH}px`;
    }

    function setFade(activeIdx: number, dur: number) {
        const slides = getAllSlides();
        slides.forEach((s, i) => {
            s.style.transition = dur > 0 ? `opacity ${dur}ms` : "none";
            s.style.opacity = i === activeIdx ? "1" : "0";
        });
    }

    // ─────────────────────────────────────────────
    // 核心方法
    // ─────────────────────────────────────────────
    function getAllSlides(): HTMLElement[] {
        return Array.from(
            wrapperEl?.querySelectorAll<HTMLElement>(".por-carousel-slide") ?? [],
        );
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
        realIndex = loop ? (idx - previewCount + realCount) % realCount : idx;
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
     * 事件触发顺序（与原始 JS 实现对齐）：
     *   slideChange → updateActiveClasses
     *   → beforeTransition → beforeSlideChangeTransition
     *   → [动画启动]
     *   → beginTransition → beginSlideChangeTransition
     *   → [动画结束]
     *   → transitioned → slideChangeTransitioned
     */
    function transitionTo(idx: number) {
        if (isTransitioning) return;
        if (!loop && (idx < 0 || idx > realCount - previewCount)) return;

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
        }

        // 更新 CSS 类（对齐 JS 实现：在事件触发前更新）
        updateActiveClasses(idx);

        // ── beforeTransition ──
        onbeforeTransition?.(getCarouselState());
        if (changed) onbeforeSlideChangeTransition?.(getCarouselState());

        const onTransitionDone = () => {
            transitionTimer = null;
            if (loop && transType !== "fade") {
                if (currentIndex < previewCount) {
                    jumpTo(realCount + currentIndex);
                } else if (currentIndex >= realCount + previewCount) {
                    jumpTo(currentIndex - realCount);
                }
            }
            isTransitioning = false;

            // ── transitioned ──
            ontransitioned?.(getCarouselState());
            if (changed) onslideChangeTransitioned?.(getCarouselState());

            if (changed) restartAutoplay();
        };

        if (transType === "fade") {
            setFade(idx, transSpeed);

            // ── beginTransition（动画已启动后触发）──
            onbeginTransition?.(getCarouselState());
            if (changed) onbeginSlideChangeTransition?.(getCarouselState());

            if (transSpeed === 0) {
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
                }, transSpeed + 50);
            }
        } else {
            setTransform(transSpeed);

            // ── beginTransition（动画已启动后触发）──
            onbeginTransition?.(getCarouselState());
            if (changed) onbeginSlideChangeTransition?.(getCarouselState());

            if (transSpeed === 0) {
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
                }, transSpeed + 50);
            }
        }
    }

    // ─────────────────────────────────────────────
    // 公共导航方法（可通过 bind:this 调用）
    // ─────────────────────────────────────────────
    export function prev() {
        if (atStart) return;
        if (loop && currentIndex < previewCount) {
            jumpTo(realCount + previewCount - 1);
            requestAnimationFrame(() => transitionTo(currentIndex - 1));
        } else {
            transitionTo(currentIndex - 1);
        }
    }

    export function next() {
        if (atEnd) return;
        if (loop && currentIndex >= realCount + previewCount) {
            jumpTo(previewCount);
            requestAnimationFrame(() => transitionTo(currentIndex + 1));
        } else {
            transitionTo(currentIndex + 1);
        }
    }

    export function slideTo(index: number, dur?: number) {
        const target = loop ? index + previewCount : index;
        dur === 0 ? jumpTo(target) : transitionTo(target);
    }

    export function slideToLoop(ri: number, dur?: number) {
        slideTo(ri, dur);
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
        if (previewCount > 1) {
            els.forEach((s) => (s.style.width = `${100 / previewCount}%`));
        }

        // 重建 loop 克隆
        // 注意：轮播图克隆管理必须直接操作 DOM，Svelte 模板无法描述此动态克隆逻辑
        if (loop) {
            for (let i = previewCount - 1; i >= 0; i--) {
                const clone = els[
                    ((els.length - 1 - i) % els.length + els.length) % els.length
                ].cloneNode(true) as HTMLElement;
                clone.classList.add("por-carousel-slide-duplicate");
                // eslint-disable-next-line svelte/no-dom-manipulation
                wrapperEl.prepend(clone);
            }
            for (let i = 0; i < previewCount * 2 - 1; i++) {
                const clone = els[i % els.length].cloneNode(true) as HTMLElement;
                clone.classList.add("por-carousel-slide-duplicate");
                // eslint-disable-next-line svelte/no-dom-manipulation
                wrapperEl.appendChild(clone);
            }
        }

        // fade 模式重新初始化布局
        if (transType === "fade") {
            initFade();
        }

        // 跳回当前 realIndex（不触发事件）
        const target = loop ? realIndex + previewCount : realIndex;
        jumpTo(target);
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

        // 重置 slide 样式
        realSlides.forEach((s) => {
            s.style.opacity = "";
            s.style.position = "";
            s.style.left = "";
            s.style.top = "";
            s.style.width = "";
        });

        // 重置 wrapper 样式
        if (wrapperEl) {
            wrapperEl.style.height = "";
            wrapperEl.style.position = "";
            wrapperEl.style.transition = "none";
            wrapperEl.style.transform = "";
        }
    }

    // ─────────────────────────────────────────────
    // 自动播放
    // ─────────────────────────────────────────────
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => {
            if (!loop && currentIndex >= realCount - previewCount) {
                slideTo(0, 0);
            } else {
                next();
            }
        }, autoplayDelay);
    }

    function restartAutoplay() {
        if (autoplayTimer !== null) {
            stopAutoplay();
            startAutoplay();
        }
    }

    function stopAutoplay() {
        if (autoplayTimer !== null) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
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

            const slideW = containerWidth / previewCount;
            if (slideW > 0) {
                const idx = Math.round(-matrix.m41 / slideW);
                const clamped = Math.max(0, Math.min(idx, allCount - previewCount));
                currentIndex = clamped;
                syncRealIndex(clamped);
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
        const isSpeedValid =
            totalDx !== 0 &&
            totalDx * endSpeed > 0 &&
            Math.abs(endSpeed) > TRIGGER_SPEED;
        const threshold = containerWidth * 0.2;

        if (isSpeedValid || Math.abs(totalDx) > threshold) {
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
            if (t.closest(".por-carousel-prev, .por-carousel-next, .por-carousel-bullet, .por-carousel-pagination")) return;
        }

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
        if (!shouldHandlePointer(e) || isScrolling) return;
        if (e.pointerType !== "touch" && e.buttons === 0) return;

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
            wasPlayingBeforeDrag = autoplayTimer !== null;
            if (autoplay) stopAutoplay();
        }
        isDragging = true;
        ptrLastX = e.clientX;
        ptrLastY = e.clientY;

        if (transType !== "fade" && wrapperEl) {
            // loop 模式拖拽中边界跳转
            if (loop) {
                const slideW = containerWidth / previewCount;
                const currentTx = dragStartTranslate + dx;
                const inferIdx = slideW > 0 ? Math.round(-currentTx / slideW) : currentIndex;
                if (inferIdx < previewCount || inferIdx >= realCount + previewCount) {
                    const targetIdx = (inferIdx - previewCount + realCount) % realCount + previewCount;
                    const jumpTx = getTranslateX(targetIdx);
                    dragStartTranslate = jumpTx - dx;
                    currentIndex = targetIdx;
                    syncRealIndex(targetIdx);
                }
            }

            let tx = dragStartTranslate + dx;

            // 非 loop 边界阻力
            if (!loop) {
                const minTx = getTranslateX(realCount - previewCount);
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
        if (!shouldHandlePointer(e) || !isDragging) return;
        endDrag();
    }

    // 鼠标 simulateTouch：在 document 监听 pointerup
    $effect(() => {
        if (!simulateTouch) return;

        function onDocPointerUp(e: PointerEvent) {
            if (e.pointerType === "touch") return;
            endDrag();
        }

        document.addEventListener("pointerup", onDocPointerUp);
        return () => document.removeEventListener("pointerup", onDocPointerUp);
    });

    // ─────────────────────────────────────────────
    // 分页圆点
    // ─────────────────────────────────────────────
    const paginationCount = $derived(
        loop ? realCount : Math.max(0, realCount - previewCount + 1),
    );
    const paginationItems = $derived(
        Array.from({ length: paginationCount }, (_, i) => i),
    );
</script>

<!-- ─────────────────────────────── -->
<!-- Template                        -->
<!-- ─────────────────────────────── -->
<div
    class={["por-carousel", transType === "fade" ? "por-carousel-fade" : "", className].filter(Boolean).join(" ")}
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
    <div class="por-carousel-wrapper" bind:this={wrapperEl}>
        {@render children?.()}
    </div>

    <!-- 分页圆点 -->
    {#if pagination}
        <div class="por-carousel-pagination" data-pagination="carousel">
            {#each paginationItems as i (i)}
                <div
                    class="por-carousel-bullet"
                    class:active={realIndex === i}
                    role="button"
                    tabindex="0"
                    aria-label="第 {i + 1} 页"
                    onclick={() => slideTo(i)}
                    onkeydown={(e) => e.key === "Enter" && slideTo(i)}
                ></div>
            {/each}
        </div>
    {/if}

    <!-- 前进/后退按钮 -->
    {#if navigation}
        <div
            class="por-carousel-prev"
            data-prev="carousel"
            class:disabled={atStart}
            role="button"
            tabindex="0"
            aria-label="上一页"
            onclick={prev}
            onkeydown={(e) => e.key === "Enter" && prev()}
        ></div>
        <div
            class="por-carousel-next"
            data-next="carousel"
            class:disabled={atEnd}
            role="button"
            tabindex="0"
            aria-label="下一页"
            onclick={next}
            onkeydown={(e) => e.key === "Enter" && next()}
        ></div>
    {/if}
</div>
