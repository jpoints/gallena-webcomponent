<svelte:options tag="mc-featurednews" />


<script>
    import {useCSS,useIcons} from './helper/styles.js';
    useCSS();
    useIcons();
    let test = ["a","b","c"]
    let location = 0;
    let current = test[location]

    function nextItem(){
        location = (location + 1) % test.length;
        current = test[location]
    }

     function prevItem(){
        location = (location + test.length - 1) % test.length;
        current = test[location]
    }
</script>

<div class="bg-gray-100 p-5 h-96 w-full shadow-lg">
    <div class="flex">
        <div class="text-2xl py-5 w-4/5">
            Featured News
        </div>
        <div class="py-5 w-1/5 text-3xl text-primary flex justify-end items-right">
            <button class="hover:text-secondary p-2" on:click={prevItem}>
                <i class="fas fa-arrow-left text-lg"></i>
            </button>
            <button class="hover:text-secondary p-2" on:click={nextItem}>
                <i class="fas fa-arrow-right text-lg"></i>
            </button>
        </div>
    </div>
    <div class="parent">
        <div class="child bg-white p-2 {current === 'a' ? 'fadeIn' : 'fadeOut'}">
            <div class="text-xl">Study Abroad Information</div>
            <div>July 01, 2016</div>
            <div class="text-lg py-5">All Gallena friends and family are welcome to join us on campus for our annual semester abroad discussion. </div>
            <div class="text-lg"><a href="/test1.html">Read Article</a></div>
        </div>
        <div class="child bg-white p-2 {current === 'b' ? 'fadeIn' : 'fadeOut'}">
            <div class="text-xl">Rabbit</div>
            <div>July 01, 2016</div>
            <div class="text-lg py-5">Jumps over the fence</div>
            <div class="text-lg"><a href="/test2.html">Read Article</a></div>
        </div>
        <div class="child bg-white p-2 {current === 'c' ? 'fadeIn' : 'fadeOut'}">
            <div class="text-xl">Dog is here</div>
            <div>July 01, 2016</div>
            <div class="text-lg py-5">All Gallena friends and family are welcome to join us on campus for our annual semester abroad discussion. </div>
            <div class="text-lg"><a href="/test3.html">Read Article</a></div>
        </div>
    </div>
</div>


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
  transition: visibility 0s linear 0s, opacity 1000ms;
}

.child {
  grid-area: 1 / 1 / 2 / 2;
}

</style>