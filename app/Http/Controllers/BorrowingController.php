<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class BorrowingController extends Controller
{
    // USER Methods
    public function indexUser()
    {
        $borrowings = Borrowing::with('item')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/MyBorrowings', [
            'borrowings' => $borrowings
        ]);
    }

    public function browse()
    {
        $items = Item::all();
        return Inertia::render('user/Browse', [
            'items' => $items
        ]);
    }

    // ADMIN Methods
    public function dashboardStats()
    {
        // Calculate stats
        $totalItems = Item::count();
        $activeBorrowings = Borrowing::where('status', 'approved')->count();
        $overdueItems = Borrowing::where('status', 'overdue')->count();

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'totalItems' => $totalItems,
                'activeBorrowings' => $activeBorrowings,
                'overdueItems' => $overdueItems
            ]
        ]);
    }

    public function indexAdmin()
    {
        $borrowings = Borrowing::with(['user', 'item'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/borrowings/Index', [
            'borrowings' => $borrowings
        ]);
    }

    public function scan()
    {
        return Inertia::render('admin/Scan');
    }

    public function lookup(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'item_id' => 'required|exists:items,id',
        ]);

        $user = \App\Models\User::find($request->user_id);
        $item = Item::find($request->item_id);

        // Notify user that scanning is in progress
        \Illuminate\Support\Facades\Cache::put('scan_status_' . $request->user_id, 'scanning', now()->addMinutes(2));

        return response()->json([
            'user_name' => $user->name,
            'item_name' => $item->name,
            'item_stock' => $item->stock,
        ]);
    }

    public function cancelScan(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        // Reset status to waiting
        \Illuminate\Support\Facades\Cache::put('scan_status_' . $request->user_id, 'waiting', now()->addMinutes(5));

        return response()->json(['message' => 'Scan cancelled']);
    }

    public function checkStatus(Request $request)
    {
        $status = \Illuminate\Support\Facades\Cache::get('scan_status_' . $request->user()->id, 'waiting');

        // Peek at recent borrowings if status is waiting/scanning to see if we missed the cache update
        if ($status !== 'approved') {
            $recentBorrowing = Borrowing::where('user_id', $request->user()->id)
                ->where('created_at', '>=', now()->subSeconds(10))
                ->exists();

            if ($recentBorrowing) {
                return response()->json(['status' => 'approved']);
            }
        }

        return response()->json(['status' => $status]);
    }

    public function processScan(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'item_id' => 'required|exists:items,id',
            'return_date' => 'required|date|after_or_equal:today',
        ]);

        $item = Item::find($request->item_id);

        if ($item->stock <= 0) {
            return back()->withErrors(['message' => 'Stock unavailable']);
        }

        // Create Borrowing Record
        Borrowing::create([
            'user_id' => $request->user_id,
            'item_id' => $request->item_id,
            'borrow_date' => now(),
            'due_date' => Carbon::parse($request->return_date)->setTimezone('Asia/Jakarta')->endOfDay(),
            'status' => 'approved', // Automatically approved by admin scan
        ]);

        // Decrement Stock
        $item->decrement('stock');

        // Notify user of success
        \Illuminate\Support\Facades\Cache::put('scan_status_' . $request->user_id, 'approved', now()->addMinutes(1));

        return back()->with('success', 'Borrowing approved successfully!');
    }

    public function returnItem(Borrowing $borrowing)
    {
        if ($borrowing->status === 'returned') {
            return back()->with('error', 'Item already returned.');
        }

        $borrowing->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);

        $borrowing->item->increment('stock');

        return back()->with('success', 'Item returned successfully.');
    }
}
