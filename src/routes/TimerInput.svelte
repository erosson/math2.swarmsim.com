<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';

	let { value, onchange } = $props<{
		value: string;
		onchange: (p: Polynomial<number> | null) => void;
	}>();
	function parse(v: string): Polynomial<number> | null {
		const coeffs = v.split(',').map((c) => parseFloat(c.trim()));
		if (coeffs.some(isNaN)) return null;
		return Polynomial.parse(coeffs);
	}
	function onchange_(v: string) {
		onchange(parse(v));
	}
	onchange_(value);
</script>

<input class="input" bind:value onchange={() => onchange_(value)} />
