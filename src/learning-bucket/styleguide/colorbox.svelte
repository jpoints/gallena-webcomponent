<svelte:options tag="mc-colorbox" />

<script>
    import lightordark from './lightordark.js';
    
    export let color = "#ffffff";
    export let colorname = "white";
    function texttype(event){
        console.log(event);
        console.log(window.getComputedStyle(event.target).backgroundColor);
    }
</script>

<link rel="stylesheet" href="/omni-cms/app.css" />

<div class="flex flex-col items-center w-64 m-5 border-2 p-5">
	<div on:load={event => texttype(event)} class="w-60 h-60 bg-{colorname} text-white flex flex-col justify-center items-center"></div>
    <div class="p-5 flex flex-col justify-center items-center">
        <p>{colorname}</p>
        <p>{color}</p>
    </div>
</div>

<style></style>