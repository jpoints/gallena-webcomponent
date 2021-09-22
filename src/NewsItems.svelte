<svelte:options tag="mc-newsitems" />


<script>
   import { onMount } from 'svelte';
   export let path;
   export let title;
   export let category = "";
   export let total = 2;

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
                                mediacontent = {"content" : kid.getAttribute("url")}
                                media.forEach(mediaitem => {
                                    let tag = mediaitem.tagName.split(":")[1]
                                    mediacontent[tag] = mediaitem.textContent;
                                });
                                article.media.push(mediacontent);
                            }
                            else if(kid.tagName === 'category'){
                                article['category'] = `${article['category']},${kid.textContent}`;
                            }
                            else{
                                article[kid.tagName] = kid.textContent;
                            }
                        });
                        articles.push(article);
                        article = {}
                        article.media = [];
                    }
                });
            });
        return articles.filter(o => {
            if(o.category){
                return o.category.includes(category)
            }
        }).slice(0,total);
   }

    onMount(async () => {
        feed = await getXML2json(path)
        loaded = true;
    })

</script>

<div class="bg-gray-100 m-2 shadow-lg p-5">
    <div class="text-2xl m-2">{title}</div>
    {#if loaded}
        <ul>
            {#each feed as item}
                <li>
                    <div class="flex flex-row justify-center items-center m-2 shadow bg-white p-2">
						<div class="w-2/5 bg-blue-200">
							<img class="" alt="{item.media[0].title}" src="{item.media[0].content}" />
						</div>
						<div class="flex flex-col justify-center justify-end w-3/5 px-5 h-full text-lg">
							<div class="whitespace-nowrap overflow-hidden"><a href="{item.link}" title="{item.title}">{item.title}</a></div>
							<div class="text-sm">{new Date(Date.parse(item.pubDate)).toLocaleDateString()}</div>
							<div class="text-sm self-end"><a href="{item.link}">Read article</a></div>
						</div>
					</div>
                </li>
            {/each}
        </ul>
    {:else}
        <p>Loading</p>
    {/if}
</div>

<link rel="stylesheet" href="/omni-cms/app.css" />

<style>

</style>