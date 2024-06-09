<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import Num from './Num.svelte';
	import type { NumT } from './units';

	type Props = { poly: Polynomial<NumT> }
	const { poly }: Props = $props();
</script>

{#snippet render(coeffs: readonly NumT[], inner: boolean)}
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
	{@render render(poly.coeffs, false)}
</code>
