<svelte:options tag="mc-navdropdown" />

<script>
    import {clickOutside} from '../helper/clickoutside.js';
    let active = false;
    let button;
    export let title = "Menu";

    function setActive(){
        console.log(active)
        active = !active;
        console.log(active)
    }

    function handleClickOutside(event) {
        console.log("hello");
		if(active){
            active = false;
           
        }
	}

    function handleEscape(event) {
		if(active){
            active = false;
            button.focus();
        }
	}
</script>

<li class="relative h-full p-4 {active ? 'border-white bg-primary' : null} hover:bg-primary" on:blur={handleClickOutside}>
	<div class="h-full block" on:click={setActive}>
        <button bind:this={button} class="border-solid border-b-2 border-transparent text-white w-36 w-full text-center">  
            {title}
            <span class="fas text-sm text-white {active ? 'fa-angle-down' : 'fa-angle-up'}"></span>
        </button>
    </div>
    {#if active}
    <div class="absolute top-14 -left-2 bg-white text-primary z-30 p-5 border-secondary border-4" use:clickOutside on:click_outside={handleClickOutside} on:press_escape={handleEscape} >
        <slot class="w-full shadow"></slot>
    </div>
    {/if}
</li>

<link rel="stylesheet" href="app.css" />
<link rel="stylesheet" href="fontawesome/css/all.min.css" />
