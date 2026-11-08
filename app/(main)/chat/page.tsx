"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'; // Next.js hook

// Component ke andar:
const searchParams = useSearchParams();
const urlProjectId = searchParams.get('id');

useEffect(() => {
  if (urlProjectId) {
    setProjectId(urlProjectId);
    // UI automatically polling route se data utha lega aur "DONE" state mein tabs dikha dega.
  }
}, [urlProjectId]);


export default function ChatPage() {
  const [activeTab, setActiveTab] = useState("chat"); // 'chat', 'script', 'v-prompt'
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  
  // User Inputs
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("Short");
  const [tone, setTone] = useState("Professional");
  
  // UI States
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API Call to Start AI Pipeline
  const handleGenerate = async () => {
    if (!topic) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setProjectData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // isNewChat true hai kyunki ye naya topic hai. User auth id abhi hardcoded hai (Replace with real session)
        body: JSON.stringify({ userId: "user_id_here", topic, type, tone, isNewChat: true }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to generate");
      }

      setProjectId(data.projectId); // Background process start ho gaya
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Polling: Har 3 second mein background pipeline ka status check karna
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const fetchStatus = async () => {
      if (!projectId) return;
      
      const res = await fetch(`/api/project/${projectId}`);
      const data = await res.json();
      
      if (res.ok) {
        setProjectData(data);
        
        // Agar status DONE ya ERROR hai, toh polling rok do
        if (data.status === "DONE" || data.status === "ERROR") {
          clearInterval(interval);
        }
      }
    };

    if (projectId && projectData?.status !== "DONE" && projectData?.status !== "ERROR") {
      fetchStatus(); // Pehli baar turant call
      interval = setInterval(fetchStatus, 3000);
    }
    
    return () => clearInterval(interval);
  }, [projectId, projectData?.status]);

  // Working Indicator Logic
  const isWorking = projectData && ["RESEARCHING", "SCRIPTING", "VPROMPTING"].includes(projectData.status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full max-w-3xl border-b bg-white p-4 flex justify-between items-center shadow-sm">
        <button className="text-sm font-medium hover:underline">← Back home</button>
        <div className="flex items-center gap-4">
          {isWorking && (
            <span className="text-orange-600 animate-pulse text-sm font-bold flex items-center gap-1">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              working
            </span>
          )}
          {/* Dummy credits. Real app mein user.credits se aayega */}
          <span className="text-sm font-bold bg-gray-100 border border-gray-300 px-3 py-1 rounded-md">Credits - 40</span>
        </div>
      </div>

      {/* TABS */}
      <div className="w-full max-w-3xl p-4 flex gap-3">
        {['chat', 'script', 'v-prompt'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full border border-gray-400 capitalize transition-colors font-medium ${
              activeTab === tab ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="w-full max-w-3xl flex-1 bg-white border border-gray-300 rounded-lg p-4 m-4 relative flex flex-col shadow-sm">
        
        {/* === CHAT TAB === */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col justify-end pb-24 overflow-y-auto">
            
            {/* AI Response Area */}
            <div className="space-y-4 mb-4">
              {projectData?.roadmap && (
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-bold text-gray-700 mb-2">Research & Roadmap:</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{projectData.roadmap}</div>
                </div>
              )}
              
              {/* Script building message (Status >= SCRIPTING) */}
              {(projectData?.status === "SCRIPTING" || projectData?.status === "VPROMPTING" || projectData?.status === "DONE") && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-lg flex items-center justify-between">
                  <span>Aapki script taiyar ho rahi hai, kuch second ya minute ruko...</span>
                  {projectData?.status === "DONE" && (
                     <button onClick={() => setActiveTab("script")} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md">View Script</button>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm">
                  {errorMsg}
                </div>
              )}
            </div>
            
            {/* Input Box Area (Bottom Fixed) */}
            <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-300 shadow-lg rounded-xl p-3">
              <input 
                type="text" 
                placeholder="Type your idea for Creation..." 
                className="w-full mb-3 p-2 outline-none border-b border-dashed border-gray-300 focus:border-black transition-colors"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isWorking}
              />
              <div className="flex gap-2 text-sm">
                <select className="border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-black" value={type} onChange={(e)=>setType(e.target.value)} disabled={isWorking}>
                  <option value="Short">Short</option>
                  <option value="Detailed">Detailed</option>
                </select>
                <select className="border border-gray-300 rounded-md px-3 py-1.5 outline-none focus:border-black" value={tone} onChange={(e)=>setTone(e.target.value)} disabled={isWorking}>
                  <option value="Professional">Professional</option>
                  <option value="Engaging">Engaging</option>
                  <option value="Humorous">Humorous</option>
                </select>
                <button 
                  onClick={handleGenerate} 
                  disabled={isWorking || isSubmitting || !topic}
                  className="ml-auto bg-black text-white px-6 py-1.5 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? "Wait..." : "Go"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === SCRIPT TAB === */}
        {activeTab === "script" && (
          <div className="flex-1 overflow-y-auto p-2">
             {projectData?.status === "SCRIPTING" && <p className="animate-pulse text-gray-500">Writing engaging script with hooks...</p>}
             
             {projectData?.script ? (
               <div className="space-y-4">
                 <h1 className="text-2xl font-bold border-b pb-2">{projectData.title || "Your Script"}</h1>
                 <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-serif">
                   {projectData.script}
                 </div>
               </div>
             ) : (
               !isWorking && <p className="text-gray-400 text-center mt-10">Script will appear here...</p>
             )}
          </div>
        )}

        {/* === V-PROMPT TAB === */}
        {activeTab === "v-prompt" && (
          <div className="flex-1 overflow-y-auto p-2">
            {projectData?.status === "VPROMPTING" && <p className="animate-pulse text-gray-500">Analyzing script for visual prompts...</p>}
            
            {projectData?.vPrompts ? (
               // JSON validate and parse
               (typeof projectData.vPrompts === 'string' ? JSON.parse(projectData.vPrompts) : projectData.vPrompts).map((item: any, i: number) => (
                 <div key={i} className="border border-gray-300 rounded-xl p-4 mb-4 bg-gray-50 shadow-sm">
                   <h4 className="font-bold border-b border-gray-200 pb-2 mb-3 text-gray-800">
                     {i + 1}. Script Visual Scene
                   </h4>
                   <p className="mb-3 text-gray-700">
                     <span className="font-semibold">Prompt -</span> {item.visualPrompt || item.text}
                   </p>
                   {item.requiresScreenshot && (
                     <label className="flex items-center gap-2 text-sm mt-3 text-blue-700 bg-blue-50 p-2 rounded-md border border-blue-200 cursor-pointer w-fit">
                       <input type="checkbox" className="w-4 h-4 rounded text-blue-600" /> 
                       Insert Document/Link Screenshot here
                     </label>
                   )}
                 </div>
               ))
            ) : (
              !isWorking && <p className="text-gray-400 text-center mt-10">Visual Prompts will appear here...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
            }
            
