import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Box, Layers, Package, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Welcome({ itemsCount }: { itemsCount: number }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white selection:bg-white selection:text-black">
                {/* Grid Background Pattern */}
                <div
                    className="pointer-events-none absolute inset-0 z-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                        maskImage:
                            'radial-gradient(ellipse at center, black 40%, transparent 80%)',
                    }}
                />

                <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 md:px-12">
                    {/* Header */}
                    <header className="flex items-center justify-between py-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-white font-bold text-black">
                                <Package className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Peminjaman
                            </span>
                        </div>

                        <nav className="flex items-center gap-6 text-sm font-medium">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded bg-white px-4 py-2 text-black transition-colors hover:bg-gray-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-gray-400 transition-colors hover:text-white"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded bg-white px-4 py-2 font-semibold text-black transition-colors hover:bg-gray-200"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </nav>
                    </header>

                    {/* Main Content Grid */}
                    <main className="grid flex-1 grid-cols-1 items-center gap-12 py-12 lg:grid-cols-2">
                        {/* Left Column: Text */}
                        <div className="flex flex-col justify-center space-y-8">
                            <h1 className="text-6xl leading-[0.9] font-black tracking-tighter md:text-8xl">
                                Sistem <br />
                                Peminjaman Alat. <br />
                                <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                                    Qr Code.
                                </span>
                            </h1>

                            <p className="max-w-lg text-xl leading-relaxed text-gray-400">
                                Sistem inventaris dengan real time tracking,
                                integrasi kode QR, dan alur kerja peminjaman
                                mudah dimengerti. Dirancang untuk kecepatan dan
                                kemudahan pengguna.
                            </p>

                            <div className="flex flex-row gap-4">
                                <Link
                                    href={register()}
                                    className="flex h-12 items-center gap-2 rounded-full bg-white px-8 font-bold text-black transition-transform hover:scale-105"
                                >
                                    Register
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="flex h-12 items-center rounded-full border border-white/20 px-8 font-medium transition-colors hover:bg-white/10"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Visualization */}
                        <div className="relative flex h-[400px] w-full items-center justify-center md:h-[600px]">
                            <StorageGrid itemsCount={itemsCount} />
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

// Visualization Component
function StorageGrid({ itemsCount }: { itemsCount: number }) {
    // Generate a grid of items
    const rows = 8;
    const cols = 6;
    const [activeCell, setActiveCell] = useState<{
        r: number;
        c: number;
    } | null>(null);

    useEffect(() => {
        // Randomly "scan" cells
        const interval = setInterval(() => {
            setActiveCell({
                r: Math.floor(Math.random() * rows),
                c: Math.floor(Math.random() * cols),
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="perspective-1000 relative aspect-[3/4] w-full max-w-md">
            {/* The Rack/Grid Container */}
            <div
                className="absolute inset-0 grid rotate-x-6 rotate-y-12 transform gap-2 rounded-xl border border-white/10 bg-zinc-900/50 p-4 backdrop-blur-sm transition-transform duration-700 ease-out hover:rotate-y-0"
                style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                }}
            >
                {Array.from({ length: rows * cols }).map((_, i) => {
                    const r = Math.floor(i / cols);
                    const c = i % cols;
                    const isActive = activeCell?.r === r && activeCell?.c === c;
                    // Random populated cells
                    const isOccupied = (i * 123 + 45) % 3 !== 0;

                    return (
                        <div
                            key={i}
                            className={`relative rounded-sm border transition-all duration-300 ${isActive ? 'z-10 scale-110 border-blue-400 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : ''} ${isOccupied && !isActive ? 'border-white/5 bg-zinc-800' : 'border-white/5 bg-transparent'} `}
                        >
                            {isOccupied && (
                                <div
                                    className={`flex h-full w-full items-center justify-center opacity-40 ${isActive ? 'opacity-100' : ''}`}
                                >
                                    <Box className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Scan Line Animation */}
                <div
                    className="animate-scan absolute top-0 left-0 h-1 w-full bg-blue-500/50 blur-sm"
                    style={{ animationDuration: '3s' }}
                />
            </div>

            {/* Float Stats Card */}
            <div className="animate-bounce-slow absolute -bottom-10 -left-10 flex items-center gap-4 rounded-lg border border-white/10 bg-black p-4 shadow-2xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-900/30">
                    <Zap className="h-5 w-5 text-green-400" />
                </div>
                <div>
                    <div className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        System Status
                    </div>
                    <div className="font-mono text-white">Operational</div>
                </div>
            </div>
            <div
                className="animate-bounce-slow absolute -top-5 -right-5 flex items-center gap-4 rounded-lg border border-white/10 bg-black p-4 shadow-2xl"
                style={{ animationDelay: '1s' }}
            >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-900/30">
                    <Layers className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <div className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                        Total Items
                    </div>
                    <div className="font-mono text-white">{itemsCount}</div>
                </div>
            </div>
        </div>
    );
}
