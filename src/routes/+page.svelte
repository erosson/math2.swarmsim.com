<script lang="ts">
	import { Polynomial } from '@erosson/polynomial';
	import PolynomialView from './Polynomial.svelte';
	import PolynomialHorner from './PolynomialHorner.svelte';
	import Num from './Num.svelte';
	import TimerPause from './TimerPause.svelte';

	let tInput = $state(`0`);
	let polyInput = $state(`10000, 2, 3, 4, 5`);

	const poly = $derived(parsePolynomial(polyInput) ?? Polynomial.zero());
	let timeOrigin = $state(Math.floor(performance.timeOrigin));
	let now = $state(Math.floor(performance.timeOrigin));
	const t = $derived(tCalc());
	const valueAt = $derived(poly.evaluate(t));
	let paused = $state(false);
	let animating = false;

	$effect(() => {
		if (!animating) {
			animate();
			animating = true;
		}
	});
	function animate() {
		if (!paused) {
			now = Date.now();
			tInput = `${tCalc()}`;
		}
		requestAnimationFrame(animate);
	}
	function tCalc() {
		return (now - timeOrigin) / 1000;
	}
	function parseAndSetT(input: string) {
		const parsed = parseFloat(input);
		if (isNaN(parsed)) return;
		now = Date.now();
		timeOrigin = now - parsed * 1000;
		console.log('setT', { now, timeOrigin, t: tCalc() });
	}
	function parsePolynomial(v: string): Polynomial<number> | null {
		const coeffs = v.split(',').map((c) => parseFloat(c.trim() || '0'));
		if (coeffs.some(isNaN)) return null;
		return Polynomial.parse(coeffs);
	}
</script>

<div class="container mx-auto space-y-8 p-8">
	<h1 class="h1">Hello Skeleton</h1>
	<p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
	<section>
		<a class="variant-filled-primary btn" href="https://kit.svelte.dev/">SvelteKit</a>
		<a class="variant-filled-secondary btn" href="https://tailwindcss.com/">Tailwind</a>
		<a class="variant-filled-tertiary btn" href="https://github.com/">GitHub</a>
	</section>
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
				oninput={() => parseAndSetT(tInput)}
			/>
		</label>
	</div>
	<TimerPause bind:paused bind:now bind:timeOrigin />

	<div class="font-mono">
		<div>f(t) = <PolynomialView value={poly} /></div>
		<div>f(t) = <PolynomialHorner value={poly} /></div>
		<div>f({t.toFixed(3)}) = <Num value={valueAt} /></div>
	</div>
</div>
