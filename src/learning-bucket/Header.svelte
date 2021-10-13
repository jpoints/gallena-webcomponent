<svelte:options tag="mc-header" />

<script>
    let customClass = null;
    export { customClass as class };
</script>

 rel="stylesheet" href="/omni-cms/app.css" />

<div class="flex flex-row bg-black text-white h-12 w-full {customClass}">
    <slot></slot>
</div>


<style>
</style>
