<?php

$schedule->command('budgetidle:run')
    ->everyThirtySeconds()
    ->withoutOverlapping(2)
    ->appendOutputTo(storage_path('logs/budgetidle.log'));
