<script lang="ts">
	import Num from './Num.svelte';
	import PolyT from './PolyT.svelte';
	import type { NumT } from './units';

	type Props = { value: NumT; i: number; length: number };
	const { value, i, length }: Props = $props();
</script>

<Num {value} /><PolyT {i} {length} />
