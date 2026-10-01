import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Borrowing {
    id: number;
    item: {
        name: string;
    };
    status: string;
    borrow_date: string;
    due_date: string;
    returned_at: string | null;
}

export default function MyBorrowings({ borrowings }: { borrowings: Borrowing[] }) {
    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-500',
            approved: 'bg-green-500',
            rejected: 'bg-red-500',
            returned: 'bg-blue-500',
            overdue: 'bg-red-700',
        };
        return <Badge className={styles[status] || 'bg-gray-500'}>{status.toUpperCase()}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'My Borrowings', href: '/user/my-borrowings' }]}>
            <Head title="My Borrowings" />
            <div className="px-4 py-6 md:px-8">
                <h1 className="text-2xl font-bold mb-6">Borrowing History</h1>
                <div className="space-y-4">
                    {borrowings.length === 0 ? (
                        <p className="text-muted-foreground">You haven't borrowed any items yet.</p>
                    ) : (
                        borrowings.map((borrowing) => (
                            <Card key={borrowing.id}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">{borrowing.item.name}</CardTitle>
                                        {getStatusBadge(borrowing.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground grid grid-cols-2 gap-2">
                                        <div>
                                            <span className="font-semibold">Borrowed:</span> {new Date(borrowing.borrow_date).toLocaleDateString()}
                                        </div>
                                        <div>
                                            <span className="font-semibold">Due:</span> {new Date(borrowing.due_date).toLocaleDateString()}
                                        </div>
                                        {borrowing.returned_at && (
                                            <div className="col-span-2">
                                                <span className="font-semibold">Returned:</span> {new Date(borrowing.returned_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
