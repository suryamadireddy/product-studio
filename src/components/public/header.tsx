import Link from "next/link";

export function Header() {
    return (
        <header className="bg-background">
            <div className="px-6 py-6">
                <nav className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-sm font-medium tracking-tight text-foreground"
                    >
                        KSM Studio
                    </Link>

                    <div className="flex items-center gap-8">
                        <Link
                            href="/projects"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Projects
                        </Link>
                        <Link
                            href="/#process"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Process
                        </Link>
                        <Link
                            href="/#about"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            About
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}