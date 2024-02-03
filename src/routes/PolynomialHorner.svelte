<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import Num from './Num.svelte';

	const { value: poly } = $props<{ value: Polynomial<number> }>();
</script>

{#snippet render(coeffs: readonly number[], inner=false)}
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
