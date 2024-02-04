export class FrameRate {
    constructor(readonly frames: readonly number[] = []) { }

    pushNow(now: number) {
        const startIndex = this.frames.findIndex(f => f > now - 1000)
        return new FrameRate([...this.frames.slice(startIndex), now])
    }
    pushTimer(t: { now: number }) {
        return this.pushNow(t.now)
    }
    get fps(): number {
        return this.frames.length
    }
}