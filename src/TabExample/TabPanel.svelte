<svelte:options tag="mc-panel" />

<script>
	import { get_current_component } from 'svelte/internal';
	import { onMount, tick } from 'svelte';
	import {useCSS} from '../helper/styles.js';
	useCSS();

	const component = get_current_component();

	export let test = "before";
	export let active = "false";
	export let name ="";
	let cssfile = "/omni-cms/app.css";

	let content;

	onMount(async () => {
		await tick();//I want this to fire after other components load
		component.setAttribute("name",name);
		component.setAttribute("active",active);
		const event = new Event('register-panel', {detail: "test",bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	});
	
	function setActive(){
		active = "true";
		const event = new Event('active', {detail: "test",bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	}
</script>

<slot class='{active === "true" ? "" : "hidden"}'></slot>

<style>
	
</style>

