<svelte:options tag="mc-featurednews" />


<script>
    let test = ["a","b","c"]
    let location = 0;
    let current = test[location]

    function nextItem(){
        location = (location + 1) % test.length;
        current = test[location]
        console.log(current)
    }

     function prevItem(){
        location = (location + test.length - 1) % test.length;
        current = test[location]
        console.log(current)
    }
</script>

<link rel="stylesheet" href="app.css" />
<link rel="stylesheet" href="fontawesome/css/all.min.css" />

<div class="bg-gray-100 p-5 h-96 w-full shadow-lg">
    <div class="flex">
        <div class="text-2xl py-5 w-4/5">
            Featured News
        </div>
        <div class="py-5 w-1/5 text-3xl text-primary flex justify-end items-right">
            <button class="hover:text-secondary p-2" on:click={prevItem}>
                <span class="far fa-arrow-alt-circle-left"></span>
            </button>
            <button class="hover:text-secondary p-2" on:click={nextItem}>
                <span class="far fa-arrow-alt-circle-right"></span>
            </button>
        </div>
    </div>
    <div class="parent">
        <div class="child bg-white {current === 'a' ? 'fadeIn' : 'fadeOut'}">
            <div class="text-xl">Study Abroad Information</div>
            <div>July 01, 2016</div>
            <div class="text-lg py-5">All Gallena friends and family are welcome to join us on campus for our annual semester abroad discussion. </div>
            <div class="text-lg"><a href="/test1.html">Read Article</a></div>
        </div>
        <div class="child bg-white {current === 'b' ? 'fadeIn' : 'fadeOut'}">
            <div class="text-xl">Rabbit</div>
            <div>July 01, 2016</div>
            <div class="text-lg py-5">Jumps over the fence</div>
            <div class="text-lg"><a href="/test2.html">Read Article</a></div>
        </div>
        <div class="child bg-white {current === 'c' ? 'fadeIn' : 'fadeOut'}">
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