<svelte:options tag="mc-tabs" />

<script>
    import { get_current_component } from 'svelte/internal';
	import { onMount} from 'svelte';
    import {useCSS} from '../helper/styles.js';
	useCSS();

	const component = get_current_component();
    let cssfile = "/omni-cms/app.css"
    if (typeof mc_css !== 'undefined') {
        cssfile = mc_css;
    }

    var reg = {
        tab:[],
        panel:[]
    }
	
	onMount(async () => {

        var firstElement = component.querySelector("mc-tab");
        
        component.addEventListener('register', function (e) {
            reg.tab.push(e.target);
            if( firstElement.getAttribute("name") === e.target.getAttribute("name")){
                e.target.setAttribute("active","true");
            }
            e.stopPropagation()
        }, false);

        component.addEventListener('register-panel', function (e) {
            reg.panel.push(e.target);
            if( firstElement.getAttribute("name") === e.target.getAttribute("name")){
                e.target.setAttribute("active","true");
            }
            e.stopPropagation()
        }, false);

        component.addEventListener('active-tab', function (e) {
            let index = e.target.getAttribute("name");
            reg.tab.forEach(element => {
                if(element.getAttribute("name") !== index){
                    element.setAttribute("active","false");
                }
            });
            reg.panel.forEach(element => {
                if(element.getAttribute("name") === index){
                    element.setAttribute("active","true");
                }
                else{
                    element.setAttribute("active","false");
                }
            });
            e.stopPropagation();
        }, false);
    });
</script>

<slot></slot>