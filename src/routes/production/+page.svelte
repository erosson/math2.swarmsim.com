<script lang="ts">
	import Num from '$lib/Num.svelte';
	import PolynomialView from '$lib/Polynomial.svelte';
	import TimerPause from '$lib/TimerPause.svelte';
	import { FrameRate } from '$lib/frame-rate';
	import { Timer } from '$lib/timer';
	import { parseCounts, parseEdges, unitName, type Edge } from '$lib/units';
	import { Polynomial, Production } from '@erosson/polynomial';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	let tInput = $state(`0`);
	let countInput = $state(`10000, 2, 3, 4, 5`);
	let prodInput = $state(`2, 3, 4, 5`);
	let timer = $state(new Timer(Math.floor(performance.timeOrigin)));
	let paused = $state(false);
	let frameRate = $state(new FrameRate());

	const edges: readonly Edge[] = $derived(parseEdges(prodInput) ?? []);
	const edgesFrom: ReadonlyMap<string, Edge> = $derived(new Map(edges.map((e) => [e.from, e])));
	const counts: ReadonlyMap<string, number> = $derived(parseCounts(countInput) ?? new Map());
	const polys: ReadonlyMap<string, Polynomial<number>> = $derived(
		counts.size === edges.length + 1
			? Production.simpleGraphToPolynomials(counts, edges)
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
			</tr>
		</thead>
		<tbody>
			{#each [...Array(polys.size).keys()].toReversed() as i}
				{@const name = unitName(i)}
				{@const poly = polys.get(name) ?? Polynomial.zero()}
				{@const prod = edgesFrom.get(name)?.each}
				{@const value = poly.evaluate(timer.elapsedSec)}
				{@const valueEach = poly.coeffs.map((c, i) =>
					Polynomial.parse([...Array(i).fill(0), c]).evaluate(timer.elapsedSec)
				)}
				<tr>
					<td>{name}</td>
					<td><Num value={counts.get(name) ?? 0} /></td>
					<td>
						{#if prod != null}
							<Num value={prod} /> {unitName(i - 1)}/sec
						{/if}
					</td>
					<td><Num value={Math.floor(value)} /></td>
					<td> f(t) = <PolynomialView value={poly} /> </td>
					<td>
						f(t) = {#each valueEach.map((e, i) => [e, i]).toReversed() as [e, i]}
							<Num value={Math.floor(e)} />{i === 0 ? '' : ' + '}
						{/each}
					</td>
					<td>
						f(t) = {#each valueEach.map((e, i) => [e, i]).toReversed() as [e, i]}
							<Num value={Math.floor(e)} />{i === 0 ? '' : ' + '}
						{/each}
						<div>
							{#each valueEach.map((e, i) => [e, i]).toReversed() as [e, i]}
								<ProgressRadial
									value={(e * 100) / (value || 1)}
									width="w-6"
									stroke={256}
									class="inline-block"
								/>
							{/each}
						</div>
					</td>
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
