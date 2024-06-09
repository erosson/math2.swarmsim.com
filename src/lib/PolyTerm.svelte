<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import Num from './Num.svelte';
	import type { NumT } from './units';

	type Props = { value: NumT; i: number; length: number };
	const { value, i, length }: Props = $props();
	const degree = $derived(length - i - 1);
</script>

{#if degree === 0}
	<Num {value} />
{:else if degree === 1}
	<Num {value} />t
{:else}
	<Num {value} />t<sup>{degree}</sup>
{/if}
