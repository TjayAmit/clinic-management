<?php

use App\Enums\ServiceCategory;

test('SingleVisit resolves to single_visit', function () {
    expect(ServiceCategory::SingleVisit->value)->toBe('single_visit');
});

test('LongTerm resolves to long_term', function () {
    expect(ServiceCategory::LongTerm->value)->toBe('long_term');
});

test('getLabel returns Single Visit and Long Term', function () {
    expect(ServiceCategory::SingleVisit->getLabel())->toBe('Single Visit');
    expect(ServiceCategory::LongTerm->getLabel())->toBe('Long Term');
});
