<svelte:options tag="mc-row" />
<link rel="stylesheet" href="app.css" />

<script>
    let customClass;
    export { customClass as class };
</script>

<div class="bg-primary h-64">
    <h1>This is a test</h1>
    <slot></slot>
</div>

<link rel="stylesheet" href="app.css" />