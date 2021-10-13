<svelte:options tag="mc-navlink" />

<script>
        import {useCSS} from '../helper/styles.js';
	useCSS();
</script>

<li class="flex justify-center relative p-4 hover:bg-primary">
        <slot></slot>
</li>