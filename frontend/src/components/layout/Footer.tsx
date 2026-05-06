import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Built with Next.js 15, FastAPI & Redis
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="https://github.com" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
            <Link href="https://linkedin.com" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </Link>
            <Link href="/visualizer" className="hover:text-primary transition-colors">
              Visualizer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
