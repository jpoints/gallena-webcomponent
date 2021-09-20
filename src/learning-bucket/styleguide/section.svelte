<svelte:options tag="mc-stylesection" />

<script>
    export let title;
     
</script>
<link rel="stylesheet" href="/omni-cms/app.css" />

<div class="flex flex-col p-10">
	<div class="text-black text-2xl w-full flex-grow text-xl pb-5">{title}</div>
    <button class="flex flex-row">
        <ul>
        <slot></slot>
        </ul>
    </button>
</div>

<style></style>