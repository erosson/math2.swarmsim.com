<script lang="ts">
	import { Timer } from './timer';

	let { paused, timer } = $props<{ paused: boolean; timer: Timer }>();

	function setPaused(value: boolean) {
		if (paused !== value) {
			if (paused) {
				timer = Timer.fromElapsedSec(Date.now(), timer.elapsedSec);
			}
			paused = value;
		}
	}
</script>

<button class="variant-filled-secondary btn block" onclick={() => setPaused(!paused)}>
	{paused ? 'Resume' : 'Pause'}
</button>
