import { get_current_component } from 'svelte/internal';
import { onMount } from 'svelte';

export function useCSS(){
    const component = get_current_component();
    const shadow = component.shadowRoot
    let cssfile = "/omni-cms/main.css"
    
    if (typeof mc_css !== 'undefined') {
        cssfile = mc_css;
    }
 
    const child = document.createElement('link');
    child.rel = 'stylesheet';
    child.href = cssfile;
    shadow.appendChild(child);   
}

export function useIcons(){
    const component = get_current_component();
    const shadow = component.shadowRoot
    let cssfile = "/omni-cms/fontawesome/css/all.min.css"
    
    if (typeof mc_icons !== 'undefined') {
        cssfile = mc_icons;
    }
 
    const child = document.createElement('link');
    child.rel = 'stylesheet';
    child.href = cssfile;
    shadow.appendChild(child);   
}