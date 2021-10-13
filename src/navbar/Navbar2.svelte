<svelte:options tag="mc-navbar2" />

<script>
    import {useCSS} from '../helper/styles.js';
	useCSS();
</script>

<section class="bg-secondary text-white w-full">
		<div class="flex flex-row items-center mx-auto">
            <mc-navdropdown class="md:hidden list-none" title="Menu">
                <slot name="mobile"></slot>
            </mc-navdropdown>
            <slot name="desktop" class="hidden md:flex"></slot>
        </div>
</section>


<style>
</style>


