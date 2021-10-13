<svelte:options tag="mc-tab" />

<script>
	import { get_current_component } from 'svelte/internal';
	import { onMount, tick } from 'svelte';
	import {useCSS} from '../helper/styles.js';
	useCSS();

	const component = get_current_component();

	export let active = "false";
	let customClass;
	export { customClass as class };
	export let name;

	onMount(async () => {
		await tick();//I want this to fire after other components load
		component.setAttribute("name",name);
		component.setAttribute("active",active);
		const event = new Event('register', {detail: "test",bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	});
	
	function setActive(){
		active = "true";
		const event = new Event('active-tab', {detail: "test",bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	}
</script>

<button class='transition-colors h-24 w-64 block {customClass} {active === "true" ? "bg-primary text-white" : ""}' on:click={setActive} name='test'>
	<slot></slot>
</button>

<style>
	
</style>

