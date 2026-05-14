<?php

return [
    'address' => env('CLINIC_ADDRESS', '123 Dental Avenue, Suite 100'),
    'city'    => env('CLINIC_CITY', 'Manila'),
    'phone'   => env('CLINIC_PHONE', '(02) 8000-0000'),
    'email'   => env('CLINIC_EMAIL', env('MAIL_FROM_ADDRESS', 'info@clinic.com')),
    'website' => env('CLINIC_WEBSITE', env('APP_URL', '#')),
];
