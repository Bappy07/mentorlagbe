
export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#F5F7F3] px-5 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="h-10 w-2/3 rounded-xl bg-[#E5EBE2]" />
        <div className="mt-4 h-5 w-1/2 rounded-lg bg-[#E5EBE2]" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-72 rounded-2xl border border-[#E5EBE2] bg-white" />
          ))}
        </div>
      </div>
    </main>
  );
}
