<?php
defined('PREVENT_DIRECT_ACCESS') OR exit('No direct script access allowed');

/**
 * Require a valid LavaLust API access token before continuing to a route.
 */
class AuthMiddleware
{
    public function handle(Closure $next)
    {
        $lava = lava_instance();
        $lava->call->database();
        $api = $lava->call->library('api');
        $api->require_jwt();

        return $next();
    }
}
