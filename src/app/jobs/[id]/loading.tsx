export default function JobDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header skeleton */}
      <header className="border-b sticky top-0 z-30 header-blur animate-header">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="h-7 sm:h-8 w-[142px] rounded bg-slate-200" />
          <div className="h-9 sm:h-10 w-20 rounded-lg bg-slate-200" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-5 sm:py-8 max-w-5xl pb-32 lg:pb-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-2 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-2 rounded bg-slate-200" />
          <div className="h-4 w-40 rounded bg-slate-200" />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main content skeleton */}
          <div className="flex-1 min-w-0 space-y-6 sm:space-y-8">
            <article className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border shadow-sm">
              {/* Badges */}
              <div className="flex gap-2 mb-3">
                <div className="h-6 w-24 rounded-full bg-slate-100" />
              </div>
              {/* Title */}
              <div className="h-8 w-3/4 rounded bg-slate-200 mb-4" />
              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 rounded-xl border border-slate-200 overflow-hidden mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white px-3 sm:px-4 py-3">
                    <div className="h-5 w-24 rounded bg-slate-100 mb-1" />
                    <div className="h-3 w-12 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
              {/* Share buttons */}
              <div className="flex gap-2 mb-6">
                <div className="h-9 w-28 rounded-lg bg-slate-100" />
                <div className="h-9 w-32 rounded-lg bg-slate-100" />
              </div>
              {/* Description */}
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
                <div className="h-4 w-4/5 rounded bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-100" />
                <div className="h-4 w-3/4 rounded bg-slate-100" />
              </div>
              {/* Section heading */}
              <div className="h-6 w-40 rounded bg-slate-200 mt-8 mb-4" />
              {/* List items */}
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-slate-100 shrink-0 mt-0.5" />
                    <div className="h-4 w-full rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Sidebar skeleton (desktop) */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <aside className="bg-white p-6 rounded-2xl border shadow-sm sticky top-24">
              <div className="h-6 w-48 rounded bg-slate-200 mb-2" />
              <div className="h-4 w-40 rounded bg-slate-100 mb-6" />
              <div className="h-12 w-full rounded-xl bg-primary/20" />
              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 rounded bg-slate-100" />
                  <div className="h-4 w-24 rounded bg-slate-100" />
                </div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-slate-100" />
                  <div className="h-4 w-20 rounded bg-slate-100" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile CTA skeleton */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 px-4 pt-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-sm border-t shadow-[0_-4px_12px_-2px_rgb(0,0,0,0.08)] z-20">
        <div className="h-12 w-full rounded-xl bg-primary/20" />
      </div>
    </div>
  );
}
