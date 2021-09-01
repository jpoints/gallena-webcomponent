<svelte:options tag="mc-profile" />


<script>
   import { onMount } from 'svelte';
   export let host;
   export let username;
   let data = [];
   let loaded = false;

   async function getProfile(host,username){
        let path = `${host}?datasource=faculty&xpath=item[EMAIL='${username}@apsu.edu']&items_per_page=1&page=1&returntype=json`       
        let response = await (await fetch(path)).json();
        return response[0];
   }

    onMount(async () => {
        try {
            host = dmc
        }catch(err){ 
            console.log('Please define the dmc host url.');
            throw err;
        }
        data = await getProfile(host,username);
        console.log(data);
        loaded= true;
    })
</script>

<link rel="stylesheet" href="app.css" />

    {#if loaded}
            <div class="p-6 bg-white flex items-center space-x-6 rounded-lg shadow-md hover:scale-105 transition transform duration-500 cursor-pointer">
                <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                </div>
        <div>
            <h1 class="text-xl font-bold text-gray-700 mb-2">{data["FIRST_NAME"]} {data["LAST_NAME"]}</h1>
            <p class="text-gray-600 w-80 text-sm">Title : {data["TITLE"]}</p>
            <p class="text-gray-600 w-80 text-sm">Email : {data["EMAIL"]}</p>
        </div>
        </div>
    {:else}
        <div class="p-6 bg-grey-200 flex items-center space-x-6 rounded-lg shadow-md">
                <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-grey-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                </div>
        <div>
            <h1 class="text-xl font-bold text-gray-700 mb-2"></h1>
             <p class="text-gray-600 w-80 text-sm">Title : </p>
            <p class="text-gray-600 w-80 text-sm">Email : </p>
        </div>
        </div>
    {/if}
<style>

</style>