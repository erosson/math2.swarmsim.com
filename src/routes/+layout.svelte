<script lang="ts">
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import '../app.pcss';
</script>

<div class="flex items-stretch">
	<aside class="min-h-screen w-56 bg-surface-500/5 p-4">
		<nav class="list-nav">
			<ul>
				<li><a href="/">Units</a></li>
				<li><a href="/polynomial">Polynomial</a></li>
				<li><LightSwitch /></li>
			</ul>
		</nav>
	</aside>
	<main>
		<slot />
	</main>
</div>
