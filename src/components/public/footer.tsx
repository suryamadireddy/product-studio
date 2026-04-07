import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-border px-6 py-12">
            <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div>
                        <p className="text-sm font-medium text-foreground">AI Product Studio</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Product strategy and design
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            href="mailto:hello@example.com"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Contact
                        </Link>
                        <Link
                            href="https://twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Twitter
                        </Link>
                        <Link
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            LinkedIn
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 md:flex-row md:items-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} AI Product Studio. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
