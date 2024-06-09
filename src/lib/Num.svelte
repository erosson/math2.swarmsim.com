<script lang="ts">
	import type { NumT } from './units';

	type Props = { value: NumT };
	const { value }: Props = $props();
	const render = new Intl.NumberFormat('en-us');
	const num: number = $derived(typeof value === 'number' ? value : value.toNumber());
</script>

<span class="font-mono">{render.format(num)}</span>
