<script lang="ts">
	import Num from '$lib/Num.svelte';
	import PolyT from '$lib/PolyT.svelte';
	import PolynomialView from '$lib/Polynomial.svelte';
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
	interface CommaSeparated {
		readonly str: string;
		readonly list: readonly string[];
	}
	function commaStr(str: string): CommaSeparated {
		const list = str.split(',').map((c) => c.trim());
		return { str, list };
	}
	function commaList(list: readonly string[], i: number, val: string): CommaSeparated {
		list = [...list.slice(0, i), val, ...list.slice(i + 1)];
		const str = list.join(', ');
		return { str, list };
	}
	let tInput = $state(params.t ?? `0`);
	let countInput = $state(commaStr(params.c ?? `10000, 2, 4, 6, 8`));
	let prodInput = $state(commaStr(params.p ?? `3, 5, 7, 9`));
	let paused = $state(params.t != null);
	// $state, not $derived, because pause
	let timer = $state(new Timer(Math.floor(performance.timeOrigin)));
	let frameRate = $state(new FrameRate());
	let opsName = $state<NumTName>(parseNumT(params.o ?? '') ?? 'number');
	let selected = $state<string | null>(null);
	let expandAllPolys = $state<boolean>(false);
	const ops = $derived(parseOps(opsName));

	const edges: readonly Edge[] = $derived(parseEdges(prodInput.str) ?? []);
	const edgesFrom: ReadonlyMap<string, Edge> = $derived(new Map(edges.map((e) => [e.from, e])));
	const countsList: readonly NumT[] = $derived(parseCountsList(countInput.str, opsName) ?? []);
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
		countInput = commaStr(counts.join(', '));
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
		const selectClasses = 'selected bg-primary-700 font-bold';
		const commonClasses = 'underline decoration-secondary-500 cursor-pointer font-mono';
		const cls = isSelected ? `${selectClasses} ${commonClasses}` : `${commonClasses}`;
		function select() {
			selected = name;
		}
		function deselect() {
			selected = null;
		}
		return {
			class: cls,
			onclick: select,
			onmouseover: select,
			onmouseout: deselect
		};
	}
</script>

<div class="container mx-auto space-y-8 p-8">
	<h1 class="text-2xl font-bold">
		The math of
		<a class="underline" target="_blank" href="https://www.swarmsim.com">Swarm Simulator</a>
	</h1>
	<p>
		Most Swarmsim calculations are polynomial equations. Use this page to explore how these
		equations work. Click an equation to see how it was constructed, then hover/tap each term to
		highlight where it came from.
	</p>
	<div class="flex">
		<label class="mx-4 my-auto">
			Time, in seconds (<code>t</code>) =
			<input
				class="input w-20"
				type="number"
				bind:value={tInput}
				oninput={() => (timer = timer.parseElapsedSec(tInput) ?? timer)}
			/>
		</label>
		<div class="mx-4 my-auto">
			<TimerPause bind:paused bind:timer />
			{frameRate.fps}fps
		</div>
		<div class="mx-4 my-auto">
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
	</div>
	<table>
		<thead>
			<tr>
				<th class="border-2 border-solid border-secondary-500">Unit</th>
				<th class="border-2 border-solid border-secondary-500">Count</th>
				<th class="border-2 border-solid border-secondary-500">Production</th>
				<th class="border-2 border-solid border-secondary-500">
					<details bind:open={expandAllPolys}>
						<summary class="cursor-pointer underline decoration-primary-500"> Polynomials </summary>
					</details>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each [...Array(polys.size).keys()] as i}
				{@const name = unitName(i)}
				{@const poly = polys.get(name) ?? Polynomial.zero()}
				{@const prod = edgesFrom.get(name)?.each}
				{@const value = poly.evaluate(timer.elapsedSec)}
				{@const valueEach: readonly NumT[] = poly.coeffs.map((c, i) =>
					Polynomial.parse([...Array(i).fill(ops.zero), c], ops).evaluate(timer.elapsedSec)
				)}
				<tr>
					<td class="border-2 border-solid border-secondary-500">
						<span {...selectable(`degree-${i}`)}>{name}<br />(degree {i})</span>
					</td>
					<td class="border-2 border-solid border-secondary-500">
						<div {...selectable(`count-${i}`)}>
							<p>{name} count</p>
							<input
								type="number"
								class="input w-24"
								value={countInput.list[i]}
								oninput={(e) => (countInput = commaList(countInput.list, i, e.currentTarget.value))}
							/>
							<!-- <Num value={ops.toNumber(countsList[i] ?? 0)} /> -->
						</div>
						<!-- <br /> -->
					</td>
					<td class="border-2 border-solid border-secondary-500">
						{#if prod != null}
							{@const prodName = unitName(i - 1)}
							<div {...selectable(`prod-${i}`)}>
								<!-- <span {...selectable(`prod-${i}`)}><Num value={prod} /> {prodName}/sec</span> -->
								<p>{prodName}/sec each</p>
								<input
									type="number"
									class="input w-24"
									value={prodInput.list[i - 1]}
									oninput={(e) =>
										(prodInput = commaList(prodInput.list, i - 1, e.currentTarget.value))}
								/>
							</div>
						{/if}
					</td>
					<td class="border-2 border-solid border-secondary-500">
						<!-- I tried this with column-oriented flexboxes first, but a table gives better copy-paste formatting because it's row-oriented -->
						<details open={expandAllPolys}>
							<summary>
								<div class="inline-block cursor-pointer font-mono underline decoration-primary-500">
									<div>
										f({timer.elapsedSec.toFixed(1)}) = <Num
											value={Math.floor(ops.toNumber(value))}
										/>
									</div>
									<div>f(t) = <PolynomialView value={poly} /></div>
								</div>
							</summary>
							<table class="text-center">
								<tbody>
									<tr>
										<td class="text-right"><code>f({timer.elapsedSec.toFixed(1)})=</code></td>
										{#each valueEach.toReversed() as e, j}
											<td class="border-x-2 border-t-2 border-solid border-tertiary-500">
												<Num value={Math.floor(ops.toNumber(e))} />
											</td>
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
											{@const iname = unitName(i + (valueEach.length - 1 - j))}
											{@const title = `${iname} produces ${percent}% of ${name} at t=${timer.elapsedSec.toFixed(0)}`}
											<td class="border-x-2 border-b-2 border-solid border-tertiary-500" {title}>
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
									<tr>
										<td class="text-right"><code>f(t)=</code></td>
										{#each poly.coeffs.toReversed() as polyCoeff, j}
											{@const degree = countsList.length - i - j - 1}
											<td class="border-x-2 border-solid border-tertiary-500">
												<!-- <PolyTerm length={poly.coeffs.length} i={j} value={polyCoeff} /> -->
												<Num value={polyCoeff} /><span {...selectable(`degree-${degree + i}`)}
													><PolyT i={j} length={poly.coeffs.length} /></span
												>
											</td>
											{#if j < poly.coeffs.length - 1}
												<td>+</td>
											{/if}
										{/each}
									</tr>
									<tr>
										<td class="text-right"><code>f(t)=</code></td>
										<!-- <td><PolynomialHorner {poly} /></td> -->
										{#each poly.coeffs.toReversed() as polyCoeff, j}
											{@const rj = poly.coeffs.length - j - 1}
											{@const count = countsList[i + rj]}
											{@const degree = countsList.length - i - j - 1}
											{@const prods = edges.slice(i, i + degree).map((e) => e.each)}
											<td class="text-mono border-2 border-solid border-tertiary-500 px-2">
												<span {...selectable(`count-${i + rj}`)}>
													<Num value={count} /></span
												>{#if prods.length}&times;({#each prods as e, k}
														<span {...selectable(`prod-${i + k + 1}`)}><Num value={e} /></span
														>{#if k < prods.length - 1}&times;{/if}
													{/each}){/if}&times;<span {...selectable(`degree-${degree + i}`)}
													>t<sup>{degree}</sup>
												</span>
												<hr style="border: 1px solid" />
												<span {...selectable(`degree-${degree + i}`)}>{prods.length}!</span>
												<!-- <PolyTerm length={poly.coeffs.length} i={j} value={polyCoeff} /> -->
											</td>
											{#if j < poly.coeffs.length - 1}
												<td>+</td>
											{/if}
										{/each}
									</tr>
								</tbody>
							</table>
						</details>
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
	<details>
		<summary>settings</summary>
		<label>
			Unit counts, comma-separated
			<input
				class="input"
				value={countInput.str}
				oninput={(e) => (countInput = commaStr(e.currentTarget.value))}
			/>
		</label>
		<label>
			Unit production, comma-separated - must be one fewer than unit counts
			<input
				class="input"
				value={prodInput.str}
				oninput={(e) => (prodInput = commaStr(e.currentTarget.value))}
			/>
		</label>
		<div>
			<label><input bind:group={opsName} type="radio" value="number" />native numbers</label>
			<label><input bind:group={opsName} type="radio" value="decimal" />Decimal.js numbers</label>
			<label
				><input bind:group={opsName} type="radio" value="break_infinity" />break_infinity.js numbers</label
			>
		</div>
	</details>
</div>
