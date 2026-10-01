export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface Item {
    id: number;
    name: string;
    item_code: string;
    stock: number;
    description?: string;
    image_path?: string; // Add image_path
    status: 'available' | 'unavailable';
    borrowed_count?: number;
    total_stock?: number;
}

export interface Borrowing {
    id: number;
    user_id: number;
    item_id: number;
    borrow_date: string;
    due_date: string;
    returned_at?: string;
    status: 'pending' | 'approved' | 'rejected' | 'returned' | 'overdue';
    admin_note?: string;
    user: User;
    item: Item;
}

export interface DashboardStats {
    totalItems: number;
    activeBorrowings: number;
    overdueItems: number;
}
