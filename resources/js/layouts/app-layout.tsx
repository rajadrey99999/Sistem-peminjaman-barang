import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { overdue_alert } = usePage().props;
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (overdue_alert) {
            setShowAlert(true);
        }
    }, [overdue_alert]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Dialog open={showAlert} onOpenChange={setShowAlert}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Overdue Items Alert!</DialogTitle>
                        <DialogDescription>
                            You have items that have exceeded the borrowing time limit. Please return them immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setShowAlert(false)}>I Understand</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayoutTemplate>
    );
};
