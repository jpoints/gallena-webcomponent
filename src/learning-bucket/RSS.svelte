<svelte:options tag="mc-rss" />


<script>
   import { onMount } from 'svelte';
   export let path;
   let feed = [];
   let loaded = false;

   async function getXML2json(path){
        let articles = [];
        let article = {};
        article.media = [];
        let mediacontent = {};
        
        await fetch(path)
            .then(res => res.text())
            .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
            .then(data => {
                let channel = data.getElementsByTagName('channel');
                let items = Array.prototype.slice.call(channel[0].children);
                items.forEach(item => {
                    if (item.tagName === 'item') {
                        let kids = Array.prototype.slice.call(item.children);
                        kids.forEach(kid => {
                            if(kid.tagName === 'media:content'){
                                let media = Array.prototype.slice.call(kid.children);
                                mediacontent = {}
                                media.forEach(mediaitem => {
                                    let tag = mediaitem.tagName.split(":")[1]
                                    mediacontent[tag] = mediaitem.textContent;
                                });
                                article.media.push(mediacontent);
                            }
                            article[kid.tagName] = kid.textContent;
                        });
                        articles.push(article);
                        article = {}
                        article.media = [];
                    }
                });
            });
        return articles
   }

    onMount(async () => {
        feed = await getXML2json(path)
        loaded = true;
        console.log(feed);
    })

</script>

<div>
    Rabbit :{loaded}
   
</div>
{#if loaded}
 {#each feed as item}
        <div class="flex w-full">
            <p class="w-1/2 p-5">{item.title}</p>
            <p class="w-1/2 p-5">{item.description}</p>
        </div>
    {/each}
{:else}
    <p>Loading</p>
{/if}

<link rel="stylesheet" href="app.css" />

<style>

</style>