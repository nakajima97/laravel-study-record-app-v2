<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();

        // ルートテンプレート（app.blade.php）の @vite がビルド済みの manifest を要求しないようにする
        $this->withoutVite();
    }
}
