export class Timer {
    readonly origin: number
    readonly now: number
    constructor(args: { origin: number, now: number } | number) {
        if (typeof args === 'number') {
            args = { origin: args, now: args }
        }
        this.origin = args.origin
        this.now = args.now
    }
    setNow(now: number): Timer {
        return new Timer({ ...this, now })
    }
    setOrigin(origin: number): Timer {
        return new Timer({ ...this, origin })
    }
    get elapsedSec(): number {
        return (this.now - this.origin) / 1000
    }
    setElapsedSec(elapsedSec: number): Timer {
        return this.setOrigin(this.now - elapsedSec * 1000)
    }
    static fromElapsedSec(now: number, elapsedSec: number): Timer {
        return new Timer(now).setElapsedSec(elapsedSec)
    }
    parseElapsedSec(input: string): Timer | null {
        const parsed = parseFloat(input);
        return (isNaN(parsed)) ? null : this.setElapsedSec(parsed);
    }

    /**
     * usage:
     * ```
     * $effect(Timer.animate({
     *     get: () => timer,
     *     set: (t: Timer) => (timer = t),
     *     isPaused: () => false,
     * }))
     * ```
     */
    static animate(lens: { get: () => Timer, set: (t: Timer) => void, isPaused: () => boolean }): () => () => void {
        // static animate(lens: { get: () => Timer, set: (t: Timer) => void, isPaused: () => boolean }): () => void {
        let animating: number | null = null
        let isCleanup = false
        function animate() {
            if (!lens.isPaused()) {
                lens.set(lens.get().setNow(Date.now()))
            }
            animating = requestAnimationFrame(animate);
        }
        return () => {
            if (animating === null) {
                animate();
            }
            return () => {
                // why isCleanup? because this function is called twice:
                // * before removing this element from the page (as I'd expect)
                // * immediately after the first run (surprising, I want to skip this)
                //
                // Exactly twice, so only cleanup the second run. Still, messy.
                if (isCleanup) {
                    console.log('animate-cancel', animating)
                    if (animating) {
                        cancelAnimationFrame(animating)
                    }
                }
                else {
                    isCleanup = true
                }
            }
        }
    }
}