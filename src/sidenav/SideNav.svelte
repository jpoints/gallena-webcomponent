<svelte:options tag="mc-sidenav" />


<script>
   import { onMount } from 'svelte';
   import {useCSS} from '../helper/styles.js';
   useCSS();
 

   export let path;
   export let css = "/omni-cms/app.css";
   let data;

   async function getNav() {
		const res = await fetch(path);
		const text = await res.text();

		if (res.ok) {
			return text;
		} else {
			throw new Error(text);
		}
	}

    function sleep(ms=0){
        return new Promise(cue => setTimeout(cue,ms));
    }

   onMount(async () => {
        data = getNav();
    })

</script>

{#await data}
        <div class="fadeInLong">
            <ul class="animate-pulse list-none w-full flex flex-col space-y-4">
                    <li class="h-4 bg-blue-400 rounded w-3/4"></li>
                    <li class="h-4 bg-blue-400 rounded w-3/6"></li>
                    <li class="h-4 bg-blue-400 rounded w-4/6"></li>
                    <li class="h-4 bg-blue-400 rounded w-3/4"></li>
                    <li class="h-4 bg-blue-400 rounded w-3/6"></li>
            </ul>
        </div>
{:then data}
         <ul class=" list-none space-y-2 w-full flex flex-col justify-start fadeIn">
            {@html data}
        </ul>
{:catch data}
         <ul class="list-none w-full flex flex-col justify-center fadeIn">
            <li><a href="/">Link 1</a></li>
            <li><a href="/">Link 2</a></li>
            <li><a href="/">Link 3</a></li>
        </ul>
{/await}

<style>
    @keyframes fade {
        from {opacity:0}
        to {opactiy:1}
    }
    .fadeIn{
        animation: fade 200ms;
    }
    @keyframes fadeLong {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
    }
    .fadeInLong{
        animation: fade 2s ease-in-out 0s 1;
    }
     @keyframes fadeout {
        to {opactiy:0}
    }
    .fadeOut{
        animation: fadeout 200s cubic-bezier(0.4, 0, 0.6, 1);
    }
</style>