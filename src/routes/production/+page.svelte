<script lang="ts">
	import { page } from '$app/stores';
	import Num from '$lib/Num.svelte';
	import PolynomialView from '$lib/Polynomial.svelte';
	import TimerPause from '$lib/TimerPause.svelte';
	import { FrameRate } from '$lib/frame-rate';
	import { Timer } from '$lib/timer';
	import {
		parseCounts,
		parseEdges,
		parseNumT,
		parseOps,
		unitName,
		type Edge,
		type NumT,
		type NumTName
	} from '$lib/units';
	import { Polynomial, Production } from '@erosson/polynomial';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	const params = {
		// TODO: refactor for adapter-static
		t: null,
		c: null,
		p: null,
		o: null
		// t: $page.url.searchParams.get('t'),
		// c: $page.url.searchParams.get('c'),
		// p: $page.url.searchParams.get('p'),
		// o: $page.url.searchParams.get('o')
	};
	let tInput = $state(params.t ?? `0`);
	let countInput = $state(params.c ?? `10000, 2, 3, 4, 5`);
	let prodInput = $state(params.p ?? `2, 3, 4, 5`);
	let timer = $state(new Timer(Math.floor(performance.timeOrigin)));
	let paused = $state(params.t != null);
	let frameRate = $state(new FrameRate());
	let opsName = $state<NumTName>(parseNumT(params.o ?? '') ?? 'number');
	const ops = $derived(parseOps(opsName));

	const edges: readonly Edge[] = $derived(parseEdges(prodInput) ?? []);
	const edgesFrom: ReadonlyMap<string, Edge> = $derived(new Map(edges.map((e) => [e.from, e])));
	const counts: ReadonlyMap<string, NumT> = $derived(parseCounts(countInput, opsName) ?? new Map());
	const polys: ReadonlyMap<string, Polynomial<NumT>> = $derived(
		counts.size === edges.length + 1
			? Production.simpleGraphToPolynomials(counts, edges, ops)
			: new Map()
	);

	$effect(
		Timer.animate({
			get: () => timer,
			set: (t: Timer) => {
				timer = t;
				tInput = `${t.elapsedSec}`;
				frameRate = frameRate.pushTimer(t);
			},
			isPaused: () => paused
		})
	);
	// $effect(() => {
	//  // apply inputs to url
	// 	let ps: URLSearchParams | null = null;
	// 	if (prodInput !== params.p) {
	// 		ps = ps || new URLSearchParams($page.url.searchParams);
	// 		ps.set('p', prodInput);
	// 	}
	// 	if (countInput !== params.c) {
	// 		ps = ps || new URLSearchParams($page.url.searchParams);
	// 		ps.set('c', countInput);
	// 	}
	// 	if (opsName !== params.o) {
	// 		ps = ps || new URLSearchParams($page.url.searchParams);
	// 		ps.set('o', opsName);
	// 	}
	// 	if (ps) {
	// 		goto(`?${ps.toString()}`, { replaceState: true });
	// 	}
	// });
</script>

<div class="container mx-auto space-y-8 p-8">
	<div>
		<label>
			Unit counts, comma-separated
			<input class="input" bind:value={countInput} />
		</label>
		<label>
			Unit production, comma-separated - must be one fewer than unit counts
			<input class="input" bind:value={prodInput} />
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
		<div>
			<label><input bind:group={opsName} type="radio" value="number" />native numbers</label>
			<label><input bind:group={opsName} type="radio" value="decimal" />Decimal.js numbers</label>
			<label
				><input bind:group={opsName} type="radio" value="break_infinity" />break_infinity.js numbers</label
			>
		</div>
	</div>
	<TimerPause bind:paused bind:timer />
	{frameRate.fps}fps

	<table>
		<thead>
			<tr>
				<th>Unit</th>
				<th>Count(0)</th>
				<th>Produces</th>
				<th>Count(t)</th>
				<th>Polynomial</th>
				<th>Evaluation</th>
				<th>typeof</th>
			</tr>
		</thead>
		<tbody>
			{#each [...Array(polys.size).keys()].toReversed() as i}
				{@const name = unitName(i)}
				{@const poly = polys.get(name) ?? Polynomial.zero()}
				{@const prod = edgesFrom.get(name)?.each}
				{@const value = poly.evaluate(timer.elapsedSec)}
				{@const valueEach: readonly NumT[] = poly.coeffs.map((c, i) =>
					Polynomial.parse([...Array(i).fill(ops.zero), c], ops).evaluate(timer.elapsedSec)
				)}
				<tr>
					<td>{name}</td>
					<td><Num value={ops.toNumber(counts.get(name) ?? 0)} /></td>
					<td>
						{#if prod != null}
							<Num value={prod} /> {unitName(i - 1)}/sec
						{/if}
					</td>
					<td><Num value={Math.floor(ops.toNumber(value))} /></td>
					<td> f(t) = <PolynomialView value={poly} /> </td>
					<td>
						f(t) = {#each valueEach.map((e, i) => [e, i]).toReversed() as [e, i]}
							<Num value={Math.floor(ops.toNumber(e))} />{i === 0 ? '' : ' + '}
						{/each}
					</td>
					<td>
						f(t) = {#each valueEach.map((e, i) => [e, i]).toReversed() as [e, i]}
							<Num value={Math.floor(ops.toNumber(e))} />{i === 0 ? '' : ' + '}
						{/each}
						<div>
							{#each valueEach.map((e, i) => [e, i]).toReversed() as [e, i]}
								<ProgressRadial
									value={(ops.toNumber(e) * 100) / (ops.toNumber(value) || 1)}
									width="w-6"
									stroke={256}
									class="inline-block"
								/>
							{/each}
						</div>
					</td>
					<td>{typeof counts.get(name)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- <div class="font-mono"> -->
	<!-- <div>f(t) = <PolynomialView value={poly} /></div> -->
	<!-- <div>f(t) = <PolynomialHorner value={poly} /></div> -->
	<!-- <div>f({timer.elapsedSec.toFixed(3)}) = <Num value={valueAt} /></div> -->
	<!-- </div> -->
</div>
