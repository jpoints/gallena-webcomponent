<svelte:options tag="mc-galleryinsert" />


<script>
    import { onMount } from 'svelte';
    let location = 0;
    export let data = [];
    console.log(data);
    let current;
    let opacity = "opacity-1"
    $: current = data[location];

    let timer = setTimer();
    let slides

    onMount(async () => {
        //data = JSON.parse(data);
        current = data[location]
        console.log(slides.children);
        console.log(slides.querySelector("slot"));
        let test = slides.querySelector("slot");
        let test2 = test.shadowRoot;
        console.log(test2);

    });

    function setTimer(){
        return setInterval(async function (){
            opacity = `opacity-0 duration-1000 ease-linear`
            await sleep(1050);
            location = (location + 1) % data.length;
            opacity = `opacity-1 duration-1000 ease-linear`
        }, 10000);
    }

    async function nextItem(){
        clearInterval(timer)
        opacity = `opacity-0 duration-1000 ease-linear`
        await sleep(1050);
        location = (location + 1) % data.length;
        timer = setTimer()
        opacity = `opacity-1 duration-1000 ease-linear`
        console.log(slides.children);
        console.log(slides.querySelector("slot"))
    }

    function prevItem(){
        location = (location + data.length - 1) % data.length;
        clearInterval(timer)
        timer = setTimer()
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

<link rel="stylesheet" href="app.css" />
<link rel="stylesheet" href="fontawesome/css/all.min.css" />
   

   <ul class="flex w-full justify-center bg-secondary p-1">
        {#each data as item,i}
            <li>
                <button class="rounded-full w-3 h-3 m-1 {location === i ? 'bg-primary' : 'bg-white'}" on:click={() => setItem(i)}></button>
            </li>
        {/each}
    </ul>
    <div class="h-48 md:h-96 bg-black">
                <div class="flex justify-center h-full w-full">
                    <div class="flex justify-center items-center w-13 bg-white">
                        <button class="text-white text-lg w-12 h-full bg-primary" on:click={prevItem}>
                                <span class="fas fa-angle-left"></span>
                        </button>
                    </div>
                    <div bind:this={slides}>
                        <div>rabbits</div>
                        <slot></slot>
                    </div>
                    <div class="flex justify-center items-center w-13 bg-white">
                        <button class="text-white text-lg w-12 h-full bg-primary" on:click={nextItem}>
                                <span class="fas fa-angle-right"></span>
                        </button>
                    </div>
                </div>
    </div>
    
<style></style>