export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/mnu-logo.png"
            alt="Mansoura National University logo"
            className="size-9 rounded-full object-contain"
          />
          <span className="font-display text-lg font-bold">
            MNU<span className="text-gradient">Hub</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 MNUHub · Mansoura National University. Built for students, by amr mosallam.
        </p>
      </div>
    </footer>
  )
}
