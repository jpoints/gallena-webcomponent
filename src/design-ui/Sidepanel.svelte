<svelte:options tag="mc-design-sidepanel" />

<script>
    import {useCSS} from '../helper/styles.js';
	useCSS();
    let opened = false;

    function opener(){
        opened = !opened
    }
</script>

<button class="m-2 border-2 opacity-70 border-white shadow-2xl bottom-0 h-16 rounded p-2 text-white text-md z-40 fixed left-0 transform bg-black" on:click={opener}>{opened ? 'Close ' : 'Open '} Design Panel</button>
<aside class="transform opacity-70 ease-in-out transition-all duration-300 top-12 -left-72 w-72 bg-black shadow fixed h-5/6 overflow-auto z-30 p-5 {!opened ? '-translate-x-0' : 'translate-x-full'}" style="direction: rtl;">
     <ul class="flex flex flex-col text-white font-bold list-none p-0 m-0" style="direction: ltr;">
            <li>
                <div class="text-xl underline">Gallena Remake</div>
                <ul class="flex flex flex-col list-none p-0 m-0">
                    <mc-navlink>
                        <a href="/design-old/index.html" class="text-white">Home Page</a>
                    </mc-navlink>
                     <mc-navlink>
                        <a href="/design-old/interior.html" class="text-white">Interior</a>
                    </mc-navlink>
                </ul>
            </li>
            <li>
                <div class="text-xl underline">Design 6</div>
                <ul class="flex flex flex-col list-none p-0 m-0">
                    <mc-navlink>
                        <a href="/design6/index.html" class="text-white">Home Page</a>
                    </mc-navlink>
                    <mc-navlink>
                        <a href="/design6/interior-2-col.html" class="text-white">Interior 2 Col</a>
                    </mc-navlink>
                     <mc-navlink>
                        <a href="/design6/interior-full.html" class="text-white">Interior Full Width</a>
                    </mc-navlink>
                     <mc-navlink>
                        <a href="/design6/faculty-profile.html" class="text-white">Faculty Profile</a>
                    </mc-navlink>
                     <mc-navlink>
                        <a href="/design6/news-room.html" class="text-white">News Room</a>
                    </mc-navlink>
                    <mc-navlink>
                        <a href="/design6/news-listing.html" class="text-white">News Listings</a>
                    </mc-navlink>
                     <mc-navlink>
                        <a href="/design6/news-article.html" class="text-white">News Article</a>
                    </mc-navlink>
                </ul>
            </li>
            <li>
            <div class="text-xl underline">Components</div>
                <ul class="list-none p-0 m-0">
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
                        <a href="/components/sidenav.html" class="text-white">Sidenav</a>
                    </mc-navlink>
                </ul>
            </li>
        </ul>
</aside>


<style>
</style>


