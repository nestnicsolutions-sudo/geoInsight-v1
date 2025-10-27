import { Map } from "lucide-react";
import { UserNav } from "@/components/auth/user-nav";
import { ThemeToggle } from "../theme-toggle";
import { BaseMapToggle } from "../base-map-toggle";

export default function Header() {
    return (
        <header className="border-b bg-card">
            <div className="flex h-16 items-center px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Map className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tighter text-foreground font-headline">
                        GeoInsight
                    </h1>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                    <BaseMapToggle />
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
