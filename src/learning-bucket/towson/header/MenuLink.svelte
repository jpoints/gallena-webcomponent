<svelte:options tag="mc-menulink" />

<script>
    export let href = "#";
    let customClass = null;
    export { customClass as class };
</script>

<link rel="stylesheet" href="app.css" />

<li class="px-5 border-solid border-b-4 border-transparent {customClass}">
	<div>
        <a href={href}>
            <slot></slot>
        </a>
    </div>
</li>