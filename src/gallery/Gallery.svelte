<svelte:options tag="mc-gallery" />

<script>
    import { onMount } from 'svelte';

    let location = 0;
    export let data = [];   
    export let path = null;

    let timer = setTimer();

    onMount(async () => {
        if(path){
            let response = await fetch(path);
            data = await response.json();
        }
        else{
            data = data.replace(/\}\,\]$/,"}]");
            try{
                data = JSON.parse(data);
            }
            catch(error){
                data= [];
                throw error;
            }
        }
        let current = data[0]
    })

    function setTimer(){
        return setInterval(function (){
            location = (location + 1) % data.length;
        }, 15000);
    }

    function nextItem(){
        location = (location + 1) % data.length;
        clearInterval(timer)
        timer = setTimer()
    }

    function prevItem(){
        location = (location + data.length - 1) % data.length;
        clearInterval(timer)
        timer = setTimer()
    }

    function setItem(current){
        location = current;
        clearInterval(timer)
        timer = setTimer()
    }
</script>

<link rel="stylesheet" href="/omni-cms/app.css" />
<link href="/omni-cms/fontawesome/css/all.min.css" rel="stylesheet"/>

   
    <div class="parent h-48 md:h-96 bg-black">
        {#each data as item,index}
        <div class="child {location === index ? 'fadeIn' : 'fadeOut'}" style='background-image: url({item.url});background-size: cover'>
                <div class="flex justify-center h-full w-full">
                    <div class="flex justify-center items-center w-13">
                        <button class="rounded-full bg-white w-12 h-12 border-black border-2 flex justify-center items-center" on:click={nextItem}>
                               <i class="fas fa-chevron-left"></i>
                        </button>
                    </div>
                    <div class="w-full flex flex-col justify-end items-start">
                        <div class="w-auto mb-2">
                            <p class="p-5 hidden md:block bg-secondary text-white">{item.title}</p>
                        </div>
                        <div class="w-auto mb-5">
                            <p class="bg-black hidden md:block bg-opacity-70 text-white p-5">{item.description}</p>
                        </div>
                        <div class="flex flex-col md:hidden">
                            <div class="w-auto text-sm">
                                <p class="bg-black bg-opacity-70 text-white p-5 w-full text-center">{item.title} <br/> {item.description}</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-center items-center w-13">
                        <button class="rounded-full bg-white w-12 h-12 border-black border-2 flex justify-center items-center" on:click={nextItem}>
                               <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
        </div>
        {/each}
    </div>
    
     
    <ul class="flex w-full justify-center">
        {#each data as item,i}
            <li>
                <button class="rounded-full w-3 h-3 m-1 {location === i ? 'bg-primary' : 'bg-secondary'}" on:click={() => setItem(i)}></button>
            </li>
        {/each}
    </ul>
    


<style>
.parent {
  display: grid;

}

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

.child {
  grid-area: 1 / 1 / 2 / 2;
}

</style>