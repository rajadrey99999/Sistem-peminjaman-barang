import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { SharedData } from '@/types';
import { Item } from '@/types/app';
import { Head, usePage, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function Browse({ items }: { items: Item[] }) {
    const { auth } = usePage<SharedData>().props;
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [scanStatus, setScanStatus] = useState<'waiting' | 'scanning' | 'approved'>('waiting');

    const generateQRData = (itemId: number) => {
        const data = {
            user_id: auth.user.id,
            item_id: itemId,
            timestamp: Date.now()
        };
        return JSON.stringify(data);
    };

    // Polling Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (selectedItem && scanStatus !== 'approved') {
            interval = setInterval(() => {
                axios.get(route('user.scan.check_status'))
                    .then(res => {
                        // Update status if it changed, including back to 'waiting'
                        if (res.data.status !== scanStatus) {
                            setScanStatus(res.data.status);
                        }
                    })
                    .catch(err => console.error("Polling error", err));
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [selectedItem, scanStatus]);

    // Handle Approval
    useEffect(() => {
        if (scanStatus === 'approved') {
            const timer = setTimeout(() => {
                setSelectedItem(null);
                setScanStatus('waiting');
                router.visit(route('user.borrowings.index'));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [scanStatus]);

    const handleClose = (open: boolean) => {
        if (!open) {
            setSelectedItem(null);
            setScanStatus('waiting');
        }
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Browse Items', href: '/user/dashboard' }]}>
            <Head title="Browse Items" />
            <div className="px-4 py-6 md:px-8">
                <h1 className="text-2xl font-bold mb-6">All Items</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <Card key={item.id} className="flex flex-col justify-between">
                            <CardHeader>
                                {/* Item Image */}
                                <div className="aspect-square w-full overflow-hidden rounded-md bg-muted mb-4">
                                    {item.image_path ? (
                                        <img 
                                            src={`/${item.image_path}`} 
                                            alt={item.name} 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <CardTitle>{item.name}</CardTitle>
                                <CardDescription>Code: {item.item_code}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{item.description || 'No description'}</p>
                                <div className="mt-4 text-sm font-semibold">
                                    Stock: <span className={item.stock > 0 ? "text-green-600" : "text-red-600"}>{item.stock}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    disabled={item.stock <= 0}
                                    onClick={() => setSelectedItem(item)}
                                >
                                    {item.stock > 0 ? 'Borrow' : 'Out of Stock'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <Dialog open={!!selectedItem} onOpenChange={handleClose}>
                    <DialogContent className="sm:max-w-md text-center">
                        <DialogHeader>
                            <DialogTitle>Borrow {selectedItem?.name}</DialogTitle>
                            <DialogDescription>
                                Show this QR code to the admin.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="flex flex-col items-center justify-center p-6 gap-6 min-h-[300px]">
                            {(!auth.user.nim || !auth.user.status) ? (
                                <div className="text-center space-y-4">
                                    <p className="text-red-500 font-medium">
                                        Please complete your profile (NIM & Status) to borrow items.
                                    </p>
                                    <Button asChild>
                                        <a href={route('profile.edit')}>Go to Profile</a>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {scanStatus === 'waiting' && selectedItem && (
                                        <div className="space-y-4 animate-in fade-in zoom-in">
                                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                                <QRCodeSVG value={generateQRData(selectedItem.id)} size={200} />
                                            </div>
                                            <p className="text-sm text-muted-foreground animate-pulse">Waiting for scan...</p>
                                        </div>
                                    )}

                                    {scanStatus === 'scanning' && (
                                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                                            <p className="text-lg font-medium text-blue-600">Processing...</p>
                                            <p className="text-sm text-muted-foreground">Admin is reviewing your request.</p>
                                        </div>
                                    )}

                                    {scanStatus === 'approved' && (
                                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in">
                                            <CheckCircle className="h-16 w-16 text-green-500" />
                                            <p className="text-lg font-bold text-green-600">Approved!</p>
                                            <p className="text-sm text-muted-foreground">Redirecting to your borrowings...</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
