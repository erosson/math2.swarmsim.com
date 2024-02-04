<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import Num from './Num.svelte';
	import type { NumT } from './units';

	const { value: poly } = $props<{ value: Polynomial<NumT> }>();
</script>

<code>
	{#each poly.coeffs.toReversed() as value, i}
		{@const degree = poly.coeffs.length - i - 1}
		{#if degree === 0}
			<Num {value} />
		{:else if degree === 1}
			<Num {value} />t +&nbsp;
		{:else}
			<Num {value} />t<sup>{degree}</sup> +&nbsp;
		{/if}
	{/each}
</code>
