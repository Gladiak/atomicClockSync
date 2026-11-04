// Keep logical focus for editing, dialogs and keyboard navigation; only its
// visual treatment follows the last input method, including restored focus.
export function installFocusModality(){
  const root=document.documentElement;
  root.dataset.focusMode='pointer';
  document.addEventListener('pointerdown',()=>{root.dataset.focusMode='pointer';},{capture:true});
  document.addEventListener('keydown',event=>{
    if(!['Shift','Control','Alt','Meta','CapsLock'].includes(event.key))root.dataset.focusMode='keyboard';
  },{capture:true});
}

export function isKeyboardFocus(element){
  return document.documentElement.dataset.focusMode!=='pointer'&&Boolean(element?.matches(':focus-visible'));
}
