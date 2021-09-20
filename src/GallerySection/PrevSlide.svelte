<svelte:options tag="mc-prevslide" />

<script>
	import { get_current_component } from 'svelte/internal';
	import { onMount, tick } from 'svelte';
	const component = get_current_component();


	export let test = "before";
	export let active = "false";
	let customClass;
	export { customClass as class };
	export let name;

	let content;

	onMount(async () => {
		await tick();//I want this to fire after other components load
		component.setAttribute("name",name);
		component.setAttribute("active",active);
		const event = new Event('register', {detail: "test",bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	});
	
	function setActive(){
		active = "true";
		const event = new Event('prev-slide', {detail: "test",bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	}
</script>

<link rel="stylesheet" href="/omni-cms/app.css" />
<button class='{customClass}' on:click={setActive}>
	<slot></slot>
</button>

<style>
	
</style>

