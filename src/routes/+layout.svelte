<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import type { Snippet } from 'svelte';
	import '../app.pcss';
	import { base } from '$app/paths';

	type Props = { children: Snippet };
	let { children }: Props = $props();
</script>

<div class="flex items-stretch">
	<aside class="min-h-screen w-56 bg-surface-500/5 p-4">
		<nav class="list-nav">
			<ul>
				<li><a href="{base}/">Units</a></li>
				<li><a href="{base}/polynomial/">Polynomial</a></li>
				<li><LightSwitch /></li>
			</ul>
		</nav>
	</aside>
	<main>
		{@render children()}
	</main>
</div>
