import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Item } from '@/types/app';

export default function ItemsIndex({ items }: { items: Item[] }) {
    const { data, setData, post, delete: destroy, reset, errors } = useForm({
        name: '',
        item_code: '',
        stock: 0,
        description: '',
        image: null as File | null,
        _method: 'POST',
    });
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            // Use POST with _method: PUT for file updates
            post(route('admin.items.update', editingItem.id), {
                forceFormData: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                    setEditingItem(null);
                },
            });
        } else {
            post(route('admin.items.store'), {
                forceFormData: true,
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                },
            });
        }
    };

    const openEdit = (item: Item) => {
        setEditingItem(item);
        setData({
            name: item.name,
            item_code: item.item_code,
            stock: item.stock,
            description: item.description || '',
            image: null,
            _method: 'PUT',
        });
        setIsOpen(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setData({
            name: '',
            item_code: '',
            stock: 0,
            description: '',
            image: null,
            _method: 'POST',
        });
        setIsOpen(true);
    }

    const deleteItem = (id: number) => {
        if (confirm('Are you sure?')) {
            destroy(route('admin.items.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Items', href: '/admin/items' }]}>
            <Head title="Manage Items" />
            <div className="flex h-full flex-col px-4 py-6 md:px-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Items Management</h1>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>Add New Item</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="item_code">Item Code</Label>
                                    <Input
                                        id="item_code"
                                        value={data.item_code}
                                        onChange={(e) => setData('item_code', e.target.value)}
                                        required
                                    />
                                    {errors.item_code && <div className="text-red-500 text-sm">{errors.item_code}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        type="number"
                                        id="stock"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', parseInt(e.target.value))}
                                        required
                                    />
                                    {errors.stock && <div className="text-red-500 text-sm">{errors.stock}</div>}
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image">Image</Label>
                                    <Input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => setData('image' as any, e.target.files ? e.target.files[0] : null)}
                                    />
                                    {errors.image && <div className="text-red-500 text-sm">{errors.image}</div>}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Total Asset</TableHead>
                                <TableHead>Borrowed</TableHead>
                                <TableHead>Available</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.item_code}</TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{(item as any).total_stock}</TableCell>
                                    <TableCell>{(item as any).borrowed_count}</TableCell>
                                    <TableCell>{item.stock}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}>Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>Delete</Button>
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
