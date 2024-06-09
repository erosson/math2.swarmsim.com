<script lang="ts">
	type Props = { i: number; length: number };
	const { i, length }: Props = $props();
	const degree = $derived(length - i - 1);
</script>

{#if degree === 0}
	<!-- zero -->
{:else if degree === 1}
	t
{:else}
	t<sup>{degree}</sup>
{/if}
