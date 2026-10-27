// Documentation-only framing: retain the normal content width while showing
// the real expanded navigation beside it. No application styles are changed.
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function prepareCaptureNavigation(window) {
  window.setContentSize(1264, 740);
  await window.webContents.insertCSS('main{margin-left:236px!important;width:calc(100% - 236px)!important}');
  const run = code => window.webContents.executeJavaScript(code, true);
  await run(`(() => {
    const sidebar=document.querySelector('.sidebar'),handle=document.getElementById('sidebar-toggle');
    if(sidebar.dataset.expanded==='true')handle.click();
    handle.click();
  })()`);

  return async function showSelectedNavigation() {
    // Modal focus can collapse the rail; restore it programmatically without
    // sending pointer input through the dialog's inert background.
    const modalOpen = await run("Boolean(document.querySelector('dialog[open]'))");
    if (!modalOpen) {
      window.webContents.sendInputEvent({ type:'mouseMove', x:4, y:100 });
    }
    await pause(250);
    await run(`(() => {
      const sidebar=document.querySelector('.sidebar');
      if(${modalOpen}&&sidebar.dataset.expanded==='true')document.getElementById('sidebar-toggle').click();
      if(sidebar.dataset.expanded!=='true')document.getElementById('sidebar-toggle').click();
      const selected=sidebar.querySelector('[aria-current="page"]');
      if(!selected)throw Error('No active menu item for documentation capture');
      const group=selected.closest('[data-nav-group]');
      if(group){
        const toggle=group.querySelector('.nav-group-toggle');
        if(toggle.getAttribute('aria-expanded')!=='true')toggle.click();
      }else{
        for(const toggle of sidebar.querySelectorAll('.nav-group-toggle[aria-expanded="true"]'))toggle.click();
      }
      document.activeElement.blur();
    })()`);
    await pause(350);
  };
};
