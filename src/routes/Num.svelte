<script lang="ts">
	const { value } = $props<{ value: number }>();
	const render = new Intl.NumberFormat('en-us');
</script>

{render.format(value)}
