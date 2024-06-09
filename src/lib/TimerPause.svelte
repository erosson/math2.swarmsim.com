<script lang="ts">
	import { Timer } from './timer';

	type Props = { paused: boolean; timer: Timer };
	let { paused = $bindable(), timer = $bindable() }: Props = $props();

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
