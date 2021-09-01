<svelte:options tag="mc-menudropdown" />

<script>
    import {clickOutside} from '../../helper/clickoutside.js';
    let customClass = null;
    export { customClass as class };
    export let active_color = "bg-white";
    export let active_text_color = "bg-black";
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

<link rel="stylesheet" href="app.css" />

<div class="relative mx-5" on:blur={handleClickOutside}>
	<div class="h-full block" on:click={setActive}>
        <button bind:this={button} class="border-solid border-b-2 border-transparent text-white w-36 w-full text-center {active ? 'border-white bg-primary' : null}">  
            {title}
        </button>
    </div>
    {#if active}
    <p>rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr</p>
    <div class="absolute top-10 w-64" use:clickOutside on:click_outside={handleClickOutside} on:press_escape={handleEscape} >
        <slot class="w-full bg-blue-500"></slot>
    </div>
    {/if}
</div>
