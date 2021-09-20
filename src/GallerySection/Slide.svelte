<svelte:options tag="mc-slide" />

<script>
	import { get_current_component } from 'svelte/internal';
	import { onMount, tick } from 'svelte';
    import { fade,fly } from 'svelte/transition';
	const component = get_current_component();


	export let test = "before";
	export let active = "false";
	let customClass;
	export { customClass as class };
	export let name;

	let content;
    $:active;

    $:if(active === "false"){
           component.classList.remove("z-10");
    }
    
    $:if(active === "true"){
        component.classList.add("z-10");
    }

    function sleep(ms=0){
        return new Promise(cue => setTimeout(cue,ms));
    }

	onMount(async () => {
		await tick();//I want this to fire after other components load
		component.setAttribute("name",name);
		component.setAttribute("active",active);
		const event = new Event('register-slide', {bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	});
	
</script>

<link rel="stylesheet" href="/omni-cms/app.css" />

    {#if active === "true"}
    <div class="w-full h-full" out:fade={{duration:800, y:300}} in:fade={{x:-140,duration:800}}>
        <slot></slot>
    </div>
    {/if}

<style>
  
</style>

