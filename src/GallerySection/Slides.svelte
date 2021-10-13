<svelte:options tag="mc-slides" />

<script> 
 import {useCSS} from '../helper/styles.js';
	useCSS();
</script>

<div class="parent">
    <slot></slot>       
</div>


<style>
.parent {
  display: grid;
  width:100%;
  height:100%
}
.parent > ::slotted(mc-slide) {
            grid-row: 1;
            grid-column: 1;        }
</style>