// app/(main)/history/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";

export default async function HistoryPage() {
  const userId = "user_id_here"; // Real app me Auth se aayega
  
  const projects = await db.project.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project History</h1>
            <p className="text-gray-500 text-sm">Aapki purani saari generated scripts aur visual prompts yahan hain.</p>
          </div>
          <Link href="/chat" className="bg-black text-white px-5 py-2 rounded-full font-medium hover:bg-gray-800 transition">
            + New Project
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {projects.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No projects found. Create your first script!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Topic & Title</th>
                    <th className="px-6 py-4 font-semibold">Cost</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{project.title || "Untitled"}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{project.topic}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {project.estimatedCost} <span className="text-xs">cr</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'DONE' ? 'bg-green-100 text-green-700' :
                          project.status === 'ERROR' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/chat?id=${project.id}`} className="text-blue-600 hover:underline text-sm font-medium">
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
