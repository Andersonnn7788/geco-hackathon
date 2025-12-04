import { fetchSpaces } from "@/lib/api";

export default async function HomePage() {
  const spaces = await fetchSpaces();

  return (
    <main className="min-h-screen p-10 bg-gray-50 dark:bg-black">
      <h1 className="text-3xl font-semibold mb-6 text-black dark:text-white">
        Available Spaces
      </h1>

      <div className="grid gap-6 md:grid-cols-2">
        {spaces.map((space: any) => (
          <div
            key={space.id}
            className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow-sm bg-white dark:bg-zinc-900"
          >
            <div className="text-sm text-emerald-500 font-medium mb-1">
              {space.type}
            </div>

            <h2 className="text-lg font-semibold text-black dark:text-white">
              {space.name}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              Capacity: {space.capacity}
            </p>

            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-2">
              {space.price}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}