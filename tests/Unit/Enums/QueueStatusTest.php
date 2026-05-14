<?php

use App\Enums\QueueStatus;

test('all 4 cases resolve to correct string values', function () {
    expect(QueueStatus::Waiting->value)->toBe('waiting');
    expect(QueueStatus::InProgress->value)->toBe('in_progress');
    expect(QueueStatus::Completed->value)->toBe('completed');
    expect(QueueStatus::NoShow->value)->toBe('no_show');
});

test('getLabel returns correct label per case', function () {
    expect(QueueStatus::Waiting->getLabel())->toBe('Waiting');
    expect(QueueStatus::InProgress->getLabel())->toBe('In Progress');
    expect(QueueStatus::Completed->getLabel())->toBe('Completed');
    expect(QueueStatus::NoShow->getLabel())->toBe('No Show');
});
