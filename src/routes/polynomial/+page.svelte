<script lang="ts">
	import Num from '$lib/Num.svelte';
	import PolynomialView from '$lib/Polynomial.svelte';
	import PolynomialHorner from '$lib/PolynomialHorner.svelte';
	import TimerPause from '$lib/TimerPause.svelte';
	import { Timer } from '$lib/timer';
	import { parseOps, type NumT } from '$lib/units';
	import { Polynomial } from '@erosson/polynomial';

	let tInput = $state(`0`);
	let polyInput = $state(`10000, 2, 3, 4, 5`);
	let timer = $state(new Timer(Math.floor(performance.timeOrigin)));
	let paused = $state(false);

	const poly = $derived(parsePolynomial(polyInput) ?? Polynomial.zero());
	const valueAt = $derived(poly.evaluate(timer.elapsedSec));

	$effect(
		Timer.animate({
			get: () => timer,
			set: (t: Timer) => {
				timer = t;
				tInput = `${t.elapsedSec}`;
			},
			isPaused: () => paused
		})
	);
	function parsePolynomial(v: string): Polynomial<NumT> | null {
		const coeffs = v.split(',').map((c) => parseFloat(c.trim() || '0'));
		if (coeffs.some(isNaN)) return null;
		return Polynomial.parse(coeffs);
	}
</script>

<div class="container mx-auto space-y-8 p-8">
	<div>
		<label>
			Polynomial's coefficients, comma-separated
			<input class="input" bind:value={polyInput} />
		</label>
		<label>
			t
			<input
				class="input w-20"
				type="number"
				bind:value={tInput}
				oninput={() => (timer = timer.parseElapsedSec(tInput) ?? timer)}
			/>
		</label>
	</div>
	<TimerPause bind:paused bind:timer />

	<div class="font-mono">
		<div>f(t) = <PolynomialView value={poly} /></div>
		<div>f(t) = <PolynomialHorner value={poly} /></div>
		<div>f({timer.elapsedSec.toFixed(3)}) = <Num value={valueAt} /></div>
	</div>
</div>
