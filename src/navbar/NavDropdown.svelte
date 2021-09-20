<svelte:options tag="mc-navdropdown" />

<script>
    import {clickOutside} from '../helper/clickoutside.js';
    let active = false;
    let button;
    export let title = "Menu";
    export let css = "/omni-cms/app.css";

    function setActive(){
        active = !active;
    }

    function handleClickOutside(event) {
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
        <button bind:this={button} class="flex justify-center border-solid border-b-2 border-transparent text-white w-36 w-full text-center">  
            {title}
            <span class="material-icons text-sm text-white">{active ? 'expand_more' : 'expand_less'}</span>
        </button>
    </div>
    <div class="absolute top-14 -left-2 bg-white text-primary z-30 p-5 border-secondary border-4 {active ? null : 'hidden'}" use:clickOutside on:click_outside={handleClickOutside} on:press_escape={handleEscape} >
        <slot class="w-full shadow"></slot>
    </div>
</li>

<link rel="stylesheet" href="{css}" />
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
