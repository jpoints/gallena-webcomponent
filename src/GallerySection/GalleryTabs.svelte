<svelte:options tag="mc-gallerytabs" />

<script>
	import { get_current_component } from 'svelte/internal';
	import { onMount, tick } from 'svelte';
	const component = get_current_component();

	let content;
    export let active = "0";
    let items = []

	onMount(async () => {
		await tick();//I want this to fire after other components load
        let slides = component.closest("mc-slides");
        items = slides.querySelectorAll("mc-slide");
        const event = new Event('register-tabber', {bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
	});

    function goToItem(item){
        const event = new CustomEvent('goto-slide', {detail: item,bubbles: true,cancelable: true,composed:true});
		component.dispatchEvent(event);
    }
</script>

<link rel="stylesheet" href="/omni-cms/app.css" />
<ul class="flex z-20">
    {#each items as item,i}
        <li on:click={() => goToItem(i)}>
            <button name="slide {i}" class="{`${active}` === `${i}` ? "bg-white" : ""} m-2 w-3 h-3 border-white border-2 rounded-full"></button>
        </li>
    {/each}
</ul>

<style>
	
</style>

