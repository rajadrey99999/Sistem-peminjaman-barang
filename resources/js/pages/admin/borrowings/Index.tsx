import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Borrowing } from '@/types/app';

export default function BorrowingsIndex({ borrowings }: { borrowings: Borrowing[] }) {
    const { post } = useForm();

    const handleReturn = (id: number) => {
        if (confirm('Mark item as returned?')) {
            post(route('admin.borrowings.return', id));
        }
    };

    const getStatusBadge = (status: Borrowing['status']) => {
        const styles = {
           pending: 'bg-yellow-500',
            approved: 'bg-green-500',
            rejected: 'bg-red-500',
            returned: 'bg-blue-500',
            overdue: 'bg-red-700',
        };
        return <Badge className={styles[status]}>{status.toUpperCase()}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Borrowings', href: '/admin/dashboard' }]}>
            <Head title="Manage Borrowings" />
            <div className="px-4 py-6 md:px-8">
                <h1 className="text-2xl font-bold mb-6">Borrowing Records</h1>
                
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Item</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {borrowings.map((b) => (
                                <TableRow key={b.id}>
                                    <TableCell>{b.user.name}</TableCell>
                                    <TableCell>{b.item.name}</TableCell>
                                    <TableCell>
                                        <div>Borrow: {new Date(b.borrow_date).toLocaleDateString()}</div>
                                        <div className="text-xs text-muted-foreground">Due: {new Date(b.due_date).toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(b.status)}</TableCell>
                                    <TableCell>
                                        {b.status === 'approved' || b.status === 'overdue' ? (
                                            <Button size="sm" onClick={() => handleReturn(b.id)}>Return</Button>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
