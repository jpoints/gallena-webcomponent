<svelte:options tag="accordion-row" />

<script>
    import {useCSS} from '../helper/styles.js';
	useCSS();
    let hidden = false;
    function toggleContent(){
        hidden = !hidden;
    }
</script>

<div class="flex flex-col">
    <div class="flex justify-between items-center bg-blue-100 p-5 rounded shadow-lg w-full" on:click={toggleContent}>
        <slot class="w-4/5 justify-self-stretch" name="row"></slot>
        <div class="justify-self-end">
            {hidden ? 'Minus' : 'Plus'}
        </div>
    </div>
    <slot name="content" class="{hidden ? '' : 'hidden'}"></slot>
</div>

<style>
   
</style>


