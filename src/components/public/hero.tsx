export function Hero() {
    return (
        <section className="relative flex min-h-[70vh] items-center px-6 py-20 md:min-h-[75vh]">
            <div className="mx-auto max-w-6xl w-full">
                <div className="max-w-3xl -mt-6 md:-mt-10">
                    <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        AI Product Studio
                    </p>

                    <h1 className="font-serif text-4xl font-normal leading-[1.05] tracking-tight text-foreground md:text-5xl lg:text-6xl">
                        Where ideas become research-backed products
                    </h1>

                    <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                        Product strategy, AI-powered workflows, and design thinking —
                        synthesized into PRDs, prototype directions, and interactive explainers.
                    </p>
                </div>
            </div>
        </section>
    );
}