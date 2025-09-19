
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/login",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/inventory"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 8756, hash: 'd11bc0a4eb2fb989aea7f831300db38ec0487cf76d6a9361f56188834a6ab961', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1209, hash: '4289be1432e4a6eaa84aa49440b18b6d4d19e10a70f11abf45bbe921fdc37470', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'inventory/index.html': {size: 47508, hash: '434659afbc274d31a77d38fa8cdaec60bce327db05f9572683f263671976872b', text: () => import('./assets-chunks/inventory_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 76736, hash: '0d027652bc04902c13fc8749a44833ba9fe33b594e1057a48115ee887aace40f', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'styles-DTTV3AOM.css': {size: 8100, hash: 'jHWbwFO0LXY', text: () => import('./assets-chunks/styles-DTTV3AOM_css.mjs').then(m => m.default)}
  },
};
