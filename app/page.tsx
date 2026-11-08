// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 p-6">
      
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-8">
        <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          Vistai AI v1.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
          Turn Ideas into <br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">
            Viral Scripts
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          AI-powered research, scriptwriting, and visual prompt generation in one click. Build for creators, powered by OpenRouter.
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            Start Creating Free
          </Link>
          <Link 
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-4 bg-white text-black border-2 border-gray-200 rounded-full font-bold text-lg hover:border-black transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Feature Highlight */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-xl mb-2">🧠 Deep Research</h3>
          <p className="text-gray-500">Perplexity AI gathers real-time data, links, and facts instantly.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-xl mb-2">✍️ Pro Scripts</h3>
          <p className="text-gray-500">Claude Sonnet crafts engaging, retention-focused hooks and stories.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-xl mb-2">🎨 Visual Prompts</h3>
          <p className="text-gray-500">Auto-generated scene prompts and screenshot cues for your edit.</p>
        </div>
      </div>
    </div>
  );
}
