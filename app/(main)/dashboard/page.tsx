import Link from "next/link";
import { db } from "@/lib/db";
// Note: Real app mein aap 'next-auth' ya Clerk se logged-in user ki ID nikalenge.
// Yahan demonstration ke liye hum ek hardcoded userId le rahe hain.

export default async function DashboardPage() {
  const userId = "user_id_here"; // Auth se aayega

  // 1. User ki details aur limits fetch karna
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return <div className="p-10 text-center">User not found. Please login.</div>;
  }

  // 2. User ki purani scripts/projects fetch karna (Latest first)
  const projects = await db.project.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      topic: true,
      status: true,
      createdAt: true,
      estimatedCost: true
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER & STATS SECTION */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
            <p className="text-gray-500">Apni nayi video script banayein ya purani history dekhein.</p>
          </div>
          
          <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-100 w-full md:w-auto">
            <div className="text-center px-4 border-r border-gray-200">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Plan</p>
              <p className={`font-bold text-lg ${user.plan === 'PAID' ? 'text-purple-600' : 'text-gray-700'}`}>
                {user.plan}
              </p>
            </div>
            <div className="text-center px-4 border-r border-gray-200">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Credits</p>
              <p className="font-bold text-lg text-gray-700">{user.credits.toFixed(1)}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Chats Today</p>
              <p className="font-bold text-lg text-gray-700">{user.chatsToday} <span className="text-sm text-gray-400">/ 3</span></p>
            </div>
          </div>
        </div>

        {/* ACTION SECTION (Go Create Button) */}
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-gray-800">Your Projects</h2>
          <Link 
            href="/chat" 
            className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all shadow-md flex items-center gap-2"
          >
            <span>+ Go Create</span>
          </Link>
        </div>

        {/* PROJECTS GRID / HISTORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
              Koi purana project nahi hai. Nayi script banwane ke liye 'Go Create' par click karein.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between h-48">
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {project.status === "DONE" && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">Done</span>}
                  {project.status === "ERROR" && <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-md font-medium">Failed</span>}
                  {!["DONE", "ERROR"].includes(project.status) && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-medium animate-pulse">In Progress</span>}
                </div>

                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-1">
                    {project.title || project.topic}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">Topic: {project.topic}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs text-gray-400">Cost: {project.estimatedCost} credits</span>
                  {/* Jab user history click kare, hum usko wapas /chat page pe bhej sakte hain purane ID ke sath */}
                  <Link 
                    href={`/chat?id=${project.id}`} 
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    View Result →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
