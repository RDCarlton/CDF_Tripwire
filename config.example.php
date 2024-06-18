<?php

// Place all app configs here
date_default_timezone_set('UTC');

// Application name
define('APP_NAME', 'Northstar');

// Content file server (Use CDN here if you have one) - used for serving images, css, js files
define('CDN_DOMAIN', 'cdfns.ddns.net');

// EVE SDE table name
define('EVE_DUMP', 'eve_sde');

// Enable Tripwire API?
define('TRIPWIRE_API', false);

// EVE API userAgent
define('USER_AGENT', 'Northstar Server - adminEmail@example.com');

// EVE SSO info
define('EVE_SSO_CLIENT', 'clientID');
define('EVE_SSO_SECRET', 'secret');
define('EVE_SSO_REDIRECT', 'http://cdfns.ddns.net/index.php?mode=sso');

// As of 2022-07-12, searching via the ESI API uses an endpoint that requires an
// authentication token. In order to use the new search functionality, you will
// need to add the `esi-search.search_structures.v1` scope to your application
// in the `developers.eveonline.com` portal. Once you have done that, this
// value can be changed from 'false' to 'true'.
define('ENABLE_SEARCH_SCOPE', true);

// Discord integration
/*define('DISCORD_WEB_HOOK', array(
	'maskID' => 'https://discord.com/api/webhooks/[discord web hook url]'
));*/
