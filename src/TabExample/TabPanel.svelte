<svelte:options tag="mc-tabpanel" />

<script>
	import { getContext } from 'svelte';
	import { TABS } from '../TabExample/Tabs.svelte';

	const panel = {};
	const { registerPanel, selectedPanel } = getContext(TABS);

	registerPanel(panel);
</script>

{#if $selectedPanel === panel}
	<slot></slot>
{/if}