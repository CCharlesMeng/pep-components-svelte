/**
 * Check if the given end time has passed.
 * @param endTime - Date string (e.g., '2025-12-31 23:59:59')
 * @param now - Current timestamp (optional, defaults to Date.now())
 */
export function isExpired(endTime: string | undefined, now: number = Date.now()): boolean {
    if (!endTime) return false;
    const end = new Date(endTime.replace(/-/g, '/')).getTime(); // Adapt different formats
    return end < now;
}

/**
 * Get remaining time string.
 * @param endTime - Date string
 * @param now - Current timestamp
 */
export function getRemainingTime(endTime: string | undefined, now: number): string {
    if (!endTime) return '';
    const end = new Date(endTime.replace(/-/g, '/')).getTime();
    const diff = end - now;
    if (diff <= 0) return '已结束';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `距结束 ${hours}:${mins}:${secs}`;
}
