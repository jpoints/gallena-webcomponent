<svelte:options tag="mc-design-sidepanel" />

<script>
    let opened = false;

    function opener(){
        opened = !opened
    }
</script>

<link rel="stylesheet" href="/omni-cms/app.css" />

<button class="m-2 border-2 opacity-70 border-white shadow-2xl bottom-0 h-16 rounded p-2 text-white text-md z-40 fixed left-0 transform bg-black" on:click={opener}>{opened ? 'Close ' : 'Open '} Design Panel</button>
<aside class="transform opacity-70 ease-in-out transition-all duration-300 top-12 -left-72 w-72 bg-black shadow fixed h-5/6 overflow-auto z-30 p-5 {!opened ? '-translate-x-0' : 'translate-x-full'}" style="direction: rtl;">
     <ul class="flex flex flex-col text-white font-bold" style="direction: ltr;">
            <li class="">
                <div class="text-xl underline">Gallena Remake</div>
                <ul class="flex flex flex-col">
                    <mc-navlink>
                        <a href="/design-old/index.html" class="text-white">Home Page</a>
                    </mc-navlink>
                     <mc-navlink>
                        <a href="/design-old/interior.html" class="text-white">Interior</a>
                    </mc-navlink>
                </ul>
            </li>
             <div class="text-xl underline">Design 6</div>
                    <mc-navlink>
                        <a href="/design6/index.html" class="text-white">Design 6</a>
                    </mc-navlink>
            <div class="text-xl underline">Components</div>
            <mc-navlink>
                <a href="/components/galleries.html" class="text-white">Galleries</a>
            </mc-navlink>
            <mc-navlink>
                <a href="/components/navbar.html" class="text-white">Navbars</a>
            </mc-navlink>
            <mc-navlink>
                <a href="/components/rssreader.html" class="text-white">RSS-Reader</a>
            </mc-navlink>
             <mc-navlink>
                <a href="/components/tabs.html" class="text-white">Tabs</a>
            </mc-navlink>
            <mc-navlink>
                <a href="/components/tabs.html" class="text-white">Sidenav</a>
            </mc-navlink>
        </ul>
</aside>


<style>
</style>


