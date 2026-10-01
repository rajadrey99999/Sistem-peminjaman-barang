<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure admin exists
        if (Schema::hasTable('users')) {
            User::firstOrCreate(
                ['email' => 'admin@admin.com'],
                [
                    'name' => 'Admin User',
                    'nim' => 'ADMIN001',
                    'status' => 'active',
                    'fakultas' => 'Teknik',
                    'password' => Hash::make('password'),
                    'role' => 'admin',
                    'email_verified_at' => now(),
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optional: delete the user
        // User::where('email', 'admin@admin.com')->delete();
    }
};
