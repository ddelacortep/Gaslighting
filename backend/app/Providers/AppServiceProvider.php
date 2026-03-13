<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Throw an exception if a lazy-loaded relationship is accessed outside production
        Model::preventLazyLoading(! app()->isProduction());
    }
}
