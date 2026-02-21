(function(){
  function injectFooter(){
    const mount = document.querySelector('[data-ela-footer]');
    if(!mount) return;

    const variant = mount.getAttribute('data-ela-footer') || 'deep';
    const file = variant === 'root' ? '/components/footerbar-root.html' : '/components/footerbar.html';

    fetch(file, { cache: 'no-store' })
      .then((r) => (r.ok ? r.text() : ''))
      .then((html) => {
        if(!html) return;
        mount.innerHTML = html;
      })
      .catch(() => {});
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectFooter);
  }else{
    injectFooter();
  }
})();
