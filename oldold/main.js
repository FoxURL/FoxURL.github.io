// Inside your global.js file linked to every page
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // The leading slash ensures it looks at foxurl.github.io/sw.js 
    // no matter what subpage or subfolder the user is currently browsing.
    navigator.serviceWorker.register('/sw.js') 
      .then(reg => console.log('Service Worker registered globally!', reg.scope))
      .catch(err => console.log('Global registration failed: ', err));
  });
}
