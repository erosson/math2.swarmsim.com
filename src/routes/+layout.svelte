<script lang="ts">
	import { AppShell, LightSwitch } from '@skeletonlabs/skeleton';
	import '../app.pcss';
</script>

<AppShell slotSidebarLeft="bg-surface-500/5 w-56 p-4">
	<svelte:fragment slot="sidebarLeft">
		<!-- Insert the list: -->
		<nav class="list-nav">
			<ul>
				<li><a href="/polynomial">Polynomial</a></li>
				<li><a href="/production">Production</a></li>
				<li><LightSwitch /></li>
			</ul>
		</nav>
		<!-- --- -->
	</svelte:fragment>
	<slot />
</AppShell>
