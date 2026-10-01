import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/types/app';

export default function Dashboard({ stats }: { stats: DashboardStats }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }]}>
            <Head title="Admin Dashboard" />
            <div className="px-4 py-6 md:px-8">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalItems}</div>
                            <p className="text-xs text-muted-foreground">in inventory</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Borrowings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.activeBorrowings}</div>
                            <p className="text-xs text-muted-foreground">on loan</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.overdueItems}</div>
                            <p className="text-xs text-muted-foreground">items overdue</p>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = route('admin.scan')}>
                            <CardHeader>
                                <CardTitle>Scan QR Code</CardTitle>
                            </CardHeader>
                            <CardContent>
                                Approvide borrowing requests from users.
                            </CardContent>
                         </Card>
                         <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = route('admin.items.index')}>
                            <CardHeader>
                                <CardTitle>Manage Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                Add, edit, or delete items from inventory.
                            </CardContent>
                         </Card>
                         <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => window.location.href = route('admin.borrowings.index')}>
                            <CardHeader>
                                <CardTitle>All Borrowings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                View history and manage returns.
                            </CardContent>
                         </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
