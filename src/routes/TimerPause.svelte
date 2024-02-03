<script lang="ts">
	let { paused, now, timeOrigin } = $props<{ paused: boolean; now: number; timeOrigin: number }>();

	function setPaused(value: boolean) {
		if (paused !== value) {
			if (paused) {
				const newNow = Date.now();
				const elapsed = newNow - now;
				now = newNow;
				timeOrigin += elapsed;
			}
			paused = value;
		}
	}
</script>

<button class="variant-filled-secondary btn block" onclick={() => setPaused(!paused)}>
	{paused ? 'Resume' : 'Pause'}
</button>
