import * as router from './router.js';

window.onhashchange = router.processRoutingAsync;
router.processRoutingAsync();