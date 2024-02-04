<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import Num from './Num.svelte';
	import type { NumT } from './units';

	const { value: poly } = $props<{ value: Polynomial<NumT> }>();
</script>

{#snippet render(coeffs: readonly NumT[], inner=false)}
	{#if coeffs.length === 0}{:else if coeffs.length === 1}
		{@const [value] = coeffs}
		<Num {value} />
	{:else}
		{@const [value, ...tail] = coeffs}
		<!-- {inner ? '(' : ''}<Num {value} /> + t {@render render(tail, true)}{inner ? ')' : ''} -->
		<Num {value} /> + t ({@render render(tail, true)})
	{/if}
{/snippet}

<code>
	{@render render(poly.coeffs)}
</code>
