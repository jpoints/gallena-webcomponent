<svelte:options tag="mc-sidenav-json" />


<script>
   import './NavSection.svelte';
   import { onMount } from 'svelte';
   import {useCSS} from '../helper/styles.js';
    useCSS();
   export let path;
   export let css = "/omni-cms/app.css";
   let data = getNav();

    async function getNav() {
        console.log(path)
		const res = await fetch(path);
		const text = await res.json();
        console.log(text)

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
        //data = getNav();
    })

</script>

{#await data}
        <div class="fadeInLong w-full">
            <ul class="animate-pulse w-full flex flex-col space-y-4">
                    <li class="h-4 bg-blue-400 rounded w-3/4"></li>
                    <li class="h-4 bg-blue-400 rounded w-3/6"></li>
                    <li class="h-4 bg-blue-400 rounded w-4/6"></li>
                    <li class="h-4 bg-blue-400 rounded w-3/4"></li>
                    <li class="h-4 bg-blue-400 rounded w-3/6"></li>
            </ul>
        </div>
{:then data}
         <ul class="w-full flex flex-col justify-center fadeIn">
            {#each data as item}
              <mc-sidenav-section item={JSON.stringify(item)}/>
            {/each}
        </ul>
{:catch data}
         <ul class="sidenav w-full flex flex-col justify-center fadeIn">
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
        animation: fade 2000ms;
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
        animation: fade 1s ease-in-out 0s 1;
    }
     @keyframes fadeout {
        to {opactiy:0}
    }
    .fadeOut{
        animation: fadeout 200s cubic-bezier(0.4, 0, 0.6, 1);
    }
</style>