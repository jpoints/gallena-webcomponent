<svelte:options tag="mc-gallery2" />

<script>
    import { onMount } from 'svelte';
    import {useCSS,useIcons} from '../helper/styles.js';
	useCSS();
    useIcons();

    export let data = "[]";
    export let src = null;
    let current;
    let opacity = "opacity-1"
    let location = 0;
    $: current = data[location];

    let timer = setTimer();

    onMount(async () => {
        console.log("this is a path", data);
        if(src){
            console.log("this is a path");
            let response = await fetch(src);
            data = await response.json();
        }
        else{
            data = JSON.parse(data);
        }
        current = data[0]
    })

    function setTimer(){
        return setInterval(async function (){
            opacity = `opacity-0 duration-1000 ease-linear`
            await sleep(1050);
            location = (location + 1) % data.length;
            opacity = `opacity-1 duration-1000 ease-linear`
        }, 15000);
    }

    async function nextItem(){
        opacity = `opacity-0 duration-1000 ease-linear`
        await sleep(1050);
        location = (location + 1) % data.length;
        opacity = `opacity-1 duration-1000 ease-linear`
    }

    async function prevItem(){
        opacity = `opacity-0 duration-1000 ease-linear`
        await sleep(1050);
        location = (location + data.length - 1) % data.length;
        opacity = `opacity-1 duration-1000 ease-linear`
    }

    function setItem(current){
        console.log("test", current);
        location = current;
        clearInterval(timer)
        timer = setTimer()
    }

    function sleep(ms=0){
        return new Promise(cue => setTimeout(cue,ms));
    }
</script>

    <div class="h-48 w-full md:w-full md:h-96 bg-black">
                <div class="flex justify-center h-full w-full">
                    <div class="flex justify-center items-center w-13 bg-primary text-white">
                        <button class="rounded-full w-12 h-full flex justify-center items-center" on:click={prevItem}>
                               <i class="fas fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="w-full flex flex-col justify-end items-start transition-opacity {opacity}" style='background-image: url({current.url});background-size: cover;'>
                       <div class="w-auto mb-2 ml-10">
                            <p class="p-5 bg-secondary text-white">{current.title}</p>
                        </div>
                        <div class="w-auto mb-5 ml-10">
                            <p class="bg-black bg-opacity-70 text-white p-5">{current.description}</p>
                        </div>
                    </div>
                    <div class="flex justify-center items-center w-13 bg-primary text-white">
                        <button class="w-12 h-full flex justify-center items-center" on:click={nextItem}>
                               <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
    </div>
    <ul class="flex w-full m-0 p-0 py-5 justify-center bg-secondary list-none">
        {#each data as item,i}
            <li>
                <button class="rounded-full w-3 h-3 m-1 {location === i ? 'bg-primary' : 'bg-white'}" on:click={() => setItem(i)}></button>
            </li>
        {/each}
    </ul>
    
<style></style>