<svelte:options tag="mc-gallery-section" />

<script>
    import { get_current_component } from 'svelte/internal';
	import { onMount} from 'svelte';
    import {useCSS} from '../helper/styles.js';
	useCSS();

	const component = get_current_component();
    let location = 0;

    var reg = {
        slides:[],
        tabber:[]
    }
	
	onMount(async () => {

        var firstElement = component.querySelector("mc-tab");
        
        component.addEventListener('register-slide', function (e) {
            reg.slides.push(e.target);
            if(reg.slides.length === 1){
                e.target.setAttribute("active",true);
            }
            e.stopPropagation();
        }, false);

        component.addEventListener('register-tabber', function (e) {
            reg.tabber.push(e.target);
            e.stopPropagation();
        }, false);

        component.addEventListener('next-slide', function (e) {
            reg.slides[location].setAttribute("active","false");
            location = (location + 1) % reg.slides.length;
            reg.slides[location].setAttribute("active",true);
            reg.tabber.forEach(element => {
              element.setAttribute("active",location);
            });
            e.stopPropagation();
        }, false);

        component.addEventListener('prev-slide', function (e) {
            reg.slides[location].setAttribute("active","false");
            location = (location + reg.slides.length - 1) % reg.slides.length;
            reg.slides[location].setAttribute("active",true);
            reg.tabber.forEach(element => {
              element.setAttribute("active",location);
            });
            e.stopPropagation();
        }, false);

        component.addEventListener('goto-slide', function (e) {
            reg.slides[location].setAttribute("active","false");
            location = e.detail;
            reg.slides[e.detail].setAttribute("active",true);
            reg.tabber.forEach(element => {
                reg.tabber[location].setAttribute("active",location);
            });
            e.stopPropagation();
        }, false);
    });
</script>

<slot></slot>