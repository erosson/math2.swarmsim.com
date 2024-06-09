<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import PolyTerm from './PolyTerm.svelte';
	import type { NumT } from './units';

	type Props = { value: Polynomial<NumT> };
	const { value: poly }: Props = $props();
</script>

<code>
	{#each poly.coeffs.toReversed() as value, i}
		<PolyTerm length={poly.coeffs.length} {i} {value} />
		{#if i !== poly.coeffs.length - 1}
			+&nbsp;
		{/if}
	{/each}
</code>
