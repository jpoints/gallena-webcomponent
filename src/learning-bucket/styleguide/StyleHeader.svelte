<svelte:options tag="mc-styleheader" />

<script>
    let results;
    import test from './test.js';
    import * as axe from "axe-core";
    import { onMount } from 'svelte';

    onMount(() => {
        console.log(test());
        console.log(axe);
    });
   

</script>

<link rel="stylesheet" href="/omni-cms/app.css" />

<div class="flex flex-col h-1/3 justify-center items-center">
	<div class="bg-primary text-white text-2xl w-full flex-grow flex items-center justify-center">Style Guide</div>
    <div class="bg-secondary w-full h-12"></div>
</div>

<style></style>