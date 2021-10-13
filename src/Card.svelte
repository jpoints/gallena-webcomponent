<svelte:options tag="mc-card" />

<script>
    import {useCSS} from './helper/styles.js';
    useCSS();
</script>

<div class="shadow-xl rounded w-full bg-gray-200 p-5 m-5">
    <slot></slot>
</div>