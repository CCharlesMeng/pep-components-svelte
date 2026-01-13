/**
 * 计时器状态原语
 * 提供全局统一的当前时间戳，用于倒计时计算
 */
export function createTimer(interval = 1000) {
    let timestamp = $state(Date.now());

    $effect(() => {
        const timerId = setInterval(() => {
            timestamp = Date.now();
        }, interval);

        return () => clearInterval(timerId);
    });

    return {
        get current() {
            return timestamp;
        }
    };
}
