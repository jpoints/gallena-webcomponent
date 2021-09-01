<svelte:options tag="mc-tab" />

<script>
	export let test = "before";
	let element;
	function fireEvent(){
		const event = new Event('build');
		element.dispatchEvent(event);
	}
</script>

<button bind:this={element} on:click={fireEvent}>HGHG {test}</button>

<style>
	
</style>

