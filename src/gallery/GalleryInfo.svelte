<svelte:options tag="mc-galleryinfo" />

<script>
    export let title;
    export let description;
</script>

<link rel="stylesheet" href="app.css" />

<div class="w-full flex flex-col justify-end items-start">
    <div class="w-auto mb-2">
        <p class="p-5 bg-secondary text-white">{title}</p>
    </div>
    <div class="w-auto mb-5">
        <p class="bg-black bg-opacity-70 text-white p-5">{description}</p>
    </div>
</div>