<svelte:options tag="mc-sidenav-section" />

<script>
    import {useCSS} from '../helper/styles.js';
    useCSS();
    export let item = {children:[]};
    import { onMount } from 'svelte';
    console.log(item);

    onMount(async () => {
        item = JSON.parse(item);
        console.log(item)
    })
</script>

{#if item.children && item.children.length > 0}
    <li class="{item.className}">
        <button>{item.title}</button>
        <ul class="pl-5">
            {#if item.link}
                <li>
                    <a href="{item.link}" target="{item.target}">{item.title}</a>
                </li>
            {/if}
            {#each item.children as child}
                <mc-sidenav-section item={JSON.stringify(child)}/>
            {/each}
        </ul>
    </li>
    {:else}
    <li class="{item.className}">
        {#if item.link}
            <a href="{item.link}" target="{item.target}">{item.title}</a>
        {:else}
            {item.title}
        {/if}
    </li>
{/if}