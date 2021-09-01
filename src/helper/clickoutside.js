/** Dispatch event on click outside of node */
export function clickOutside(node) {
  
    const handleClick = event => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        node.dispatchEvent(
          new CustomEvent('click_outside', node)
        )
      }
    }
    document.addEventListener('click', handleClick, true);


    const handleEscape = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
          node.dispatchEvent(
            new CustomEvent('press_escape', node)
          )
        }
      }
    document.addEventListener('keydown', function(event){
        if(event.key === "Escape"){
            handleEscape(event);
        }
    },true);
    
    const handleEnter = event => {
        if (node && !node.contains(event.target) && !event.defaultPrevented) {
          node.dispatchEvent(
            new CustomEvent('press_enter', node)
          )
        }
      }
    document.addEventListener('keydown', function(event){
        if(event.key === "Enter"){
            handleEnter(event);
        }
    },true);    
    
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('keydown', handleEscape, true);
      }
    }
  }