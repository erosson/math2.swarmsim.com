<script lang="ts">
	const { value } = $props<{ value: number }>();
	const render = new Intl.NumberFormat('en-us');
</script>

<span class="font-mono">{render.format(value)}</span>
