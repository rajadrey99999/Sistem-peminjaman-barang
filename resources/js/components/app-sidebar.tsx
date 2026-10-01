import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types'; // Import SharedData
import { Link, usePage } from '@inertiajs/react'; 
import { BookOpen, Folder, LayoutGrid, Package } from 'lucide-react'; 
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    // Add Borrow Items for everyone (or specifically User)
    // Admin likely also wants to see items to manage them
    if (auth.user.role === 'user') {
        mainNavItems.push({
            title: 'Borrow Items',
            href: route('user.dashboard'), 
            icon: Package,
        });
        mainNavItems.push({
            title: 'My Borrowing',
            href: route('user.borrowings.index'), 
            icon: BookOpen,
        });
    } else {
        // Admin Sidebar
        mainNavItems.push({
            title: 'Scan QR',
            href: route('admin.scan'), 
            icon: Package,
        });
        mainNavItems.push({
             title: 'Manage Items',
             href: route('admin.items.index'),
             icon: Package,
        });
         mainNavItems.push({
             title: 'All Borrowings',
             href: route('admin.borrowings.index'),
             icon: BookOpen,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
