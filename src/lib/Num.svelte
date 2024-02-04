<script lang="ts">
	import type { NumT } from './units';

	const { value } = $props<{ value: number }>();
	const render = new Intl.NumberFormat('en-us');
</script>

<span class="font-mono">{render.format(value)}</span>
