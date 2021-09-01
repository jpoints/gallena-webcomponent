<svelte:options tag="mc-tabs" />

<script>
    import { onMount } from 'svelte';
	let test;
	
	onMount(async () => {
        document.addEventListener('build', function (e) {console.log(e,"hello")}, false);
    });
</script>

<div style="color:red;" bind:this={test}>
	<slot test="dog"></slot>
</div>