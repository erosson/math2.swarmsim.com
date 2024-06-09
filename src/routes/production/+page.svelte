<script lang="ts">
	import Num from '$lib/Num.svelte';
	import PolyTerm from '$lib/PolyTerm.svelte';
	import TimerPause from '$lib/TimerPause.svelte';
	import { FrameRate } from '$lib/frame-rate';
	import { Timer } from '$lib/timer';
	import {
		keyByUnit,
		parseCountsList,
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
	let countInput = $state(params.c ?? `10000, 2, 4, 6, 8`);
	let prodInput = $state(params.p ?? `3, 5, 7, 9`);
	let paused = $state(params.t != null);
	// $state, not $derived, because pause
	let timer = $state(new Timer(Math.floor(performance.timeOrigin)));
	let frameRate = $state(new FrameRate());
	let opsName = $state<NumTName>(parseNumT(params.o ?? '') ?? 'number');
	let selected = $state<string | null>(null);
	const ops = $derived(parseOps(opsName));

	const edges: readonly Edge[] = $derived(parseEdges(prodInput) ?? []);
	const edgesFrom: ReadonlyMap<string, Edge> = $derived(new Map(edges.map((e) => [e.from, e])));
	const countsList: readonly NumT[] = $derived(parseCountsList(countInput, opsName) ?? []);
	const counts: ReadonlyMap<string, NumT> = $derived(keyByUnit(countsList));
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
	function reify() {
		const units = countsList.map((_, i) => unitName(i));
		const counts = units.map((u) => polys.get(u)!.evaluate(timer.elapsedSec));
		countInput = counts.join(', ');
		timer = timer.setOrigin(timer.now);
	}
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
	function selectable(name: string) {
		const isSelected = selected === name;
		function select() {
			console.log('select', name);
			selected = name;
		}
		function deselect() {
			console.log('deselect', name);
			selected = null;
		}
		return {
			class: isSelected ? 'selected' : 'deselected',
			onclick: select,
			onmouseover: select,
			onmouseout: deselect
		};
	}
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
	<div>
		<details>
			<summary class="variant-filled-secondary btn-group" tabindex="-1">
				<button onclick={reify}>Reify</button>
				<div role="button" tabindex="0" class="btn cursor-pointer">?</div>
			</summary>
			<div>
				<p>
					Change the start time (the real-world time at which t=0) to <code>now</code>, updating
					unit counts to match.
				</p>
				<p>Swarmsim reifies before buying units, casting abilities, or other discontinuities.</p>
			</div>
		</details>
	</div>
	<div>
		<TimerPause bind:paused bind:timer />
		{frameRate.fps}fps
	</div>

	<table class="bordered">
		<thead>
			<tr>
				<th>Unit</th>
				<th>Degree</th>
				<th>Count(0)</th>
				<th>Produces</th>
				<th>Count(t)</th>
				<!-- <th>Polynomial</th> -->
				<th>Evaluation</th>
				<!-- <th>Percentage</th> -->
				<!-- <th>typeof</th> -->
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
					<td><span {...selectable(`degree-${i}`)}>{name}</span></td>
					<td><span {...selectable(`degree-${i}`)}>{i}</span></td>
					<td>
						<span {...selectable(`count-${i}`)}>
							<Num value={ops.toNumber(countsList[i] ?? 0)} />
						</span>
					</td>
					<td>
						{#if prod != null}
							<span {...selectable(`prod-${i}`)}><Num value={prod} /> {unitName(i - 1)}/sec</span>
						{/if}
					</td>
					<td style="font-family:monospace">
						<table>
							<tbody>
								<tr {...selectable(`count-${i}`)}>
									<td>f(0)=</td>
									<td><Num value={ops.toNumber(counts.get(name) ?? 0)} /></td>
								</tr>
								<tr>
									<td>f({timer.elapsedSec.toFixed(1)})=</td>
									<td><Num value={Math.floor(ops.toNumber(value))} /></td>
								</tr>
							</tbody>
						</table>
					</td>
					<!-- <td> f(t) = <PolynomialView value={poly} /> </td> -->
					<!-- <td> -->
					<!-- f(t) = {#each valueEach.map((e, j) => [e, j]).toReversed() as [e, j]} -->
					<!-- <Num value={Math.floor(ops.toNumber(e))} />{j === 0 ? '' : ' + '} -->
					<!-- {/each} -->
					<!-- </td> -->
					<td>
						<!-- I tried this with column-oriented flexboxes first, but a table gives better copy-paste formatting because it's row-oriented -->
						<table class="polynomial">
							<tbody>
								<tr>
									<td style="text-align:right"><code>f(t)=</code></td>
									<!-- <td><PolynomialHorner {poly} /></td> -->
									{#each poly.coeffs.toReversed() as polyCoeff, j}
										{@const rj = poly.coeffs.length - j - 1}
										{@const count = countsList[i + rj]}
										{@const degree = countsList.length - i - j - 1}
										{@const prods = edges.slice(i, i + degree).map((e) => e.each)}
										<td class="term top-term">
											<span {...selectable(`count-${i + rj}`)}><Num value={count} /></span
											>{#if prods.length}&times;({#each prods as e, k}
													<span {...selectable(`prod-${i + k + 1}`)}><Num value={e} /></span
													>{#if k < prods.length - 1}&times;{/if}
												{/each}){/if}&times;<span {...selectable(`degree-${degree + i}`)}
												>t<sup>{degree}</sup></span
											>
											<hr style="border: 1px solid black" />
											<span {...selectable(`degree-${degree + i}`)}>{prods.length}!</span>
											<!-- <PolyTerm length={poly.coeffs.length} i={j} value={polyCoeff} /> -->
										</td>
										{#if j < poly.coeffs.length - 1}
											<td>+</td>
										{/if}
									{/each}
								</tr>
								<tr>
									<td style="text-align:right"><code>f(t)=</code></td>
									{#each poly.coeffs.toReversed() as polyCoeff, j}
										<td class="term top-term">
											<PolyTerm length={poly.coeffs.length} i={j} value={polyCoeff} />
										</td>
										{#if j < poly.coeffs.length - 1}
											<td>+</td>
										{/if}
									{/each}
								</tr>
								<tr>
									<td style="text-align:right"><code>f({timer.elapsedSec.toFixed(1)})=</code></td>
									{#each valueEach.toReversed() as e, j}
										<td class="term"><Num value={Math.floor(ops.toNumber(e))} /></td>
										{#if j < poly.coeffs.length - 1}
											<td>+</td>
										{/if}
									{/each}
								</tr>
								<tr>
									<td></td>
									{#each valueEach.toReversed() as e, j}
										{@const percent = Math.round(
											(ops.toNumber(e) * 100) / (ops.toNumber(value) || 1)
										)}
										{@const iname = unitName(i + j)}
										{@const title = `${iname} produces ${percent}% of ${name} at t=${timer.elapsedSec.toFixed(0)}`}
										<td class="term bottom-term" {title}>
											<ProgressRadial
												value={percent}
												width="w-6"
												stroke={256}
												class="inline-block"
											/>
										</td>
										{#if j < poly.coeffs.length - 1}
											<td></td>
										{/if}
									{/each}
								</tr>
							</tbody>
						</table>
					</td>
					<!-- <td>{typeof counts.get(name)}</td> -->
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

<style>
	table.bordered td {
		border: 2px inset;
	}
	table.polynomial td {
		border: none;
		font-family: monospace;
	}
	table td.term {
		border-left: 2px outset;
		border-right: 2px outset;
		text-align: center;
	}
	table td.top-term {
		border-top: 2px outset;
	}
	table td.bottom-term {
		border-bottom: 2px outset;
	}
	.selected {
		background-color: yellow;
		font-weight: bold;
	}
	.deselected,
	.selected {
		text-decoration: underline;
		cursor: pointer;
		font-family: monospace;
	}
</style>
