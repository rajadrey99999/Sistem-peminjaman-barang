import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from "date-fns";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Scan() {
    const [scanResult, setScanResult] = useState<{ user_id: number; item_id: number } | null>(null);
    const [lookupData, setLookupData] = useState<{ user_name: string; item_name: string; item_stock: number } | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef(false);
    const regionId = "html5qr-code-full-region";

    const { data, setData, post, processing, reset, errors } = useForm({
        user_id: '',
        item_id: '',
        return_date: undefined as Date | undefined,
    });

    // Cleanup on unmount
    useEffect(() => {
        return () => {
             if (scannerRef.current) {
                 try {
                     // We don't check isScanning here because the state might be stale in cleanup
                     // But we suppress errors if it wasn't running
                     scannerRef.current.stop().catch(err => {
                         // Ignore "not running" errors
                         if (typeof err === "string" && err.includes("not running")) return;
                         console.warn("Cleanup stop error:", err);
                     });
                 } catch (e) {
                     // ignore
                 }
             }
        };
    }, []);

    // Cleanup success timer
    useEffect(() => {
        if(showSuccess) {
            const timer = setTimeout(() => {
                router.visit(route('admin.dashboard'));
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccess]);

    // Lookup User and Item details when scanResult changes
    useEffect(() => {
        if (scanResult) {
            axios.post(route('admin.scan.lookup'), {
                user_id: scanResult.user_id,
                item_id: scanResult.item_id
            })
            .then(res => {
                setLookupData(res.data);
                setData((prev) => ({
                    ...prev,
                    user_id: scanResult.user_id.toString(),
                    item_id: scanResult.item_id.toString()
                }));
            })
            .catch(err => {
                console.error("Lookup failed", err);
                alert("Failed to details. Invalid QR?");
                setScanResult(null);
            });
        } else {
            setLookupData(null);
        }
    }, [scanResult]);

    const startCamera = async () => {
        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(regionId);
            }
            const config = { fps: 10, rememberLastUsedCamera: true };
            
            // Reset processing flag
            isProcessingRef.current = false;

            await scannerRef.current.start(
                { facingMode: "environment" },
                config,
                onScanSuccess,
                onScanFailure
            );
            setIsScanning(true);
        } catch (err) {
            console.error("Error starting camera", err);
        }
    };

    const stopCamera = async () => {
         if (scannerRef.current) {
             try {
                // If not running, this will throw, which we catch.
                // We do NOT check isScanning state here to avoid stale closure issues.
                await scannerRef.current.stop();
             } catch (err) {
                 // Suppress "not running" errors which happen if usage stops it before cleanup or multiple calls
                 console.warn("Error stopping camera (might be already stopped)", err);
             } finally {
                setIsScanning(false);
             }
         }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const html5QrCode = new Html5Qrcode("file-region"); // clean instance for file scan
        
        try {
            const decodedText = await html5QrCode.scanFile(file, true);
            onScanSuccess(decodedText);
        } catch (err) {
            console.error("Error scanning file", err);
            alert("No QR code found in image.");
        }
    };

    async function onScanSuccess(decodedText: string) {
        // Prevent multiple processings (debounce/throttle)
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            const parsed = JSON.parse(decodedText);
            if (parsed.user_id && parsed.item_id) {
                // Stop scanning on success BEFORE setting result
                // This prevents the scanner from crashing because the DOM element was removed
                await stopCamera();
                
                setScanResult(parsed);
            } else {
               // invalid format, allow retry?
               isProcessingRef.current = false; 
            }
        } catch (e: any) {
            console.error("Invalid QR Code", e);
            isProcessingRef.current = false;
        }
    }

    function onScanFailure(error: any) {
        // Suppress benign errors
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.process_scan'), {
            onSuccess: () => {
                setScanResult(null);
                setLookupData(null);
                reset();
                setShowSuccess(true);
            }
        });
    };

    // Calculate duration for display
    const calculateDuration = () => {
        if (!data.return_date) return 0;
        const diffTime = Math.abs(data.return_date.getTime() - new Date().getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Scan QR', href: '/admin/scan' }]}>
            <Head title="Scan QR Code" />
            <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-center">Scan Borrowing Request</h1>
                
                <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
                    <AlertDialogContent className="flex flex-col items-center justify-center text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl text-center">Proses Berhasil</AlertDialogTitle>
                            <AlertDialogDescription className="text-center">
                                Borrowing request has been approved successfully.
                                <br />
                                Redirecting to dashboard...
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {!scanResult ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Scan Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Tabs defaultValue="camera" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="camera">Camera</TabsTrigger>
                                    <TabsTrigger value="file">Upload Image</TabsTrigger>
                                </TabsList>
                                <TabsContent value="camera" className="flex flex-col items-center gap-4">
                                     <div id={regionId} className="w-full md:w-[400px] aspect-square bg-muted rounded overflow-hidden"></div>
                                     <div className="flex gap-2">
                                         {!isScanning ? (
                                             <Button onClick={startCamera}>Start Camera</Button>
                                         ) : (
                                             <Button variant="destructive" onClick={stopCamera}>Stop Camera</Button>
                                         )}
                                     </div>
                                </TabsContent>
                                <TabsContent value="file">
                                    <div className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-4">
                                        <Label htmlFor="qr-file">Upload Image with QR Code</Label>
                                        <Input 
                                            id="qr-file" 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                        <div id="file-region" className="hidden"></div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Verify Request</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {lookupData ? (
                                lookupData.item_stock <= 0 ? (
                                    <div className="flex flex-col items-center justify-center p-6 gap-4 text-center">
                                        <div className="p-3 bg-red-100 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-red-700">Item Unavailable</h3>
                                        <div className="bg-muted p-4 rounded-lg w-full max-w-sm">
                                            <p className="font-semibold">{lookupData.item_name}</p>
                                            <p className="text-sm text-muted-foreground">Current Stock: {lookupData.item_stock}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">This item cannot be borrowed because it is out of stock.</p>
                                        <Button 
                                            variant="destructive" 
                                            className="w-full"
                                            onClick={() => {
                                                if (scanResult?.user_id) {
                                                    axios.post(route('admin.scan.cancel'), { user_id: scanResult.user_id })
                                                       .catch(err => console.error("Cancel failed", err));
                                                }
                                                setScanResult(null); 
                                                setLookupData(null); 
                                            }}
                                        >
                                            Cancel / Reset
                                        </Button>
                                    </div>
                                ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted/50 rounded-lg border">
                                            <Label className="text-muted-foreground">User Name</Label>
                                            <div className="text-lg font-semibold">{lookupData.user_name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">ID: {scanResult.user_id}</div>
                                        </div>
                                        <div className="p-4 bg-muted/50 rounded-lg border">
                                            <Label className="text-muted-foreground">Item Name</Label>
                                            <div className="text-lg font-semibold">{lookupData.item_name}</div>
                                             <div className="text-xs text-muted-foreground mt-1">Stock: {lookupData.item_stock}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label>Return Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !data.return_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.return_date ? format(data.return_date, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.return_date}
                                                    onSelect={(date) => setData('return_date', date)}
                                                    initialFocus
                                                    disabled={(date) => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        return date < today;
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {data.return_date && (
                                            <div className="text-sm text-muted-foreground">
                                                Duration: {calculateDuration()} days
                                            </div>
                                        )}
                                        {errors.return_date && <div className="text-red-500 text-sm">{errors.return_date}</div>}
                                    </div>

                                    <div className="flex gap-2 justify-end pt-4">
                                        <Button type="button" variant="outline" onClick={() => {
                                            // Ensure we send the cancel request before clearing state
                                            if (scanResult?.user_id) {
                                                const userId = scanResult.user_id;
                                                axios.post(route('admin.scan.cancel'), { user_id: userId })
                                                    .catch(err => console.error("Cancel failed", err));
                                            }
                                            setScanResult(null); 
                                            setLookupData(null); 
                                        }}>Cancel</Button>
                                        <Button type="submit" disabled={processing || !data.return_date}>Approve Borrowing</Button>
                                    </div>
                                </form>
                                    )
                                ) : (
                                <div className="flex justify-center p-8">Loading details...</div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
