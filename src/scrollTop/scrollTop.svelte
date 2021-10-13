<svelte:options tag="mc-scrolltop" />


<script>
    import {useCSS,useIcons} from '../helper/styles.js';
    useCSS();
    useIcons();
   let visible = false;
   import { onMount } from 'svelte';
    onMount(async () => {
        window.onscroll = function() {scrollFunction()};
    });

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            visible = true;
        } else {
            visible = false;
        }
    }

    function goToTop(){
       window.scroll({
        top: 0,
        behavior: 'smooth'
       });
    }
</script>

<button class="
            z-40
            rounded-full border-white border-2 
            bg-primary text-white 
            fixed bottom-10 right-10 
            w-16 h-16 p-5
            flex justify-center items-center
            focus:border-black focus:bg-white focus:text-primary
            {visible ? 'fadeIn':'fadeOut'}" 
        on:click={goToTop} 
        title="Scroll to Top">
    <i class="fas fa-chevron-up"></i>
</button>

<style>
    .fadeOut {
        visibility: hidden;
        opacity: 0;
        z-index: 0;
        transition: visibility 0s linear 1000ms, opacity 1000ms;
    }


    .fadeIn {
        visibility: visible;
        opacity: 1;
        z-index: 0;
        transition: visibility 0s linear 0s, opacity 3000ms;
    }
</style>