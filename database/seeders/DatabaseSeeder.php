<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Item;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin
        User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('A1234567?'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Create Regular User
        User::firstOrCreate(
            ['email' => 'user@user.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );

        // Create Dummy Items
        $items = [
            ['name' => 'Laptop Dell Latitude', 'item_code' => 'ITM-001', 'stock' => 5],
            ['name' => 'Projector Epson', 'item_code' => 'ITM-002', 'stock' => 2],
            ['name' => 'Speaker JBL', 'item_code' => 'ITM-003', 'stock' => 1],
            ['name' => 'Mouse Logitech', 'item_code' => 'ITM-004', 'stock' => 10],
            ['name' => 'HDMI Cable', 'item_code' => 'ITM-005', 'stock' => 15],
        ];

        foreach ($items as $item) {
            Item::firstOrCreate(
                ['item_code' => $item['item_code']],
                $item
            );
        }
    }
}
