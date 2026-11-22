
export default function DashboardLoading() {
  return (
    <main className="min-h-screen animate-pulse bg-[#F5F7F3] p-8">
      <div className="h-8 w-64 rounded-lg bg-[#E5EBE2]" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-[#E5EBE2] bg-white" />
        ))}
      </div>
      <div className="mt-8 h-72 rounded-2xl border border-[#E5EBE2] bg-white" />
    </main>
  );
}
