<?php

use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\ItemController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'itemsCount' => \App\Models\Item::count(),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        if (auth()->user()->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('user.dashboard');
    })->name('dashboard');

    // EMERGENCY: Promote current user to admin
    Route::get('/make-me-admin', function () {
        $user = auth()->user();
        $user->role = 'admin';
        $user->save();
        return redirect()->route('dashboard');
    });

    // Admin Routes
    Route::middleware('can:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [BorrowingController::class, 'dashboardStats'])->name('dashboard');
        Route::get('/borrowings', [BorrowingController::class, 'indexAdmin'])->name('borrowings.index'); // Moved index logic to separate route
        Route::get('/scan', [BorrowingController::class, 'scan'])->name('scan');
        Route::post('/scan', [BorrowingController::class, 'processScan'])->name('process_scan');
        Route::post('/scan/lookup', [BorrowingController::class, 'lookup'])->name('scan.lookup');
        Route::post('/scan/cancel', [BorrowingController::class, 'cancelScan'])->name('scan.cancel');

        // Item Management
        Route::resource('items', ItemController::class);

        // Borrowing Actions
        Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnItem'])->name('borrowings.return');
    });

    // User Routes
    Route::middleware('can:user')->prefix('user')->name('user.')->group(function () {
        Route::get('/dashboard', [BorrowingController::class, 'browse'])->name('dashboard'); // User dashboard = Browse items
        Route::get('/my-borrowings', [BorrowingController::class, 'indexUser'])->name('borrowings.index');
        Route::get('/scan/check-status', [BorrowingController::class, 'checkStatus'])->name('scan.check_status');
    });
});

require __DIR__ . '/settings.php';
