// components/chat/ChatBox.tsx
"use client";

interface ChatBoxProps {
  topic: string;
  setTopic: (val: string) => void;
  type: string;
  setType: (val: string) => void;
  tone: string;
  setTone: (val: string) => void;
  onGenerate: () => void;
  isWorking: boolean;
}

export default function ChatBox({ topic, setTopic, type, setType, tone, setTone, onGenerate, isWorking }: ChatBoxProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white border border-gray-300 shadow-lg rounded-xl p-3 z-10">
      <input 
        type="text" 
        placeholder="Type your idea for Creation..." 
        className="w-full mb-3 p-2 outline-none border-b border-dashed border-gray-300 focus:border-black transition-colors bg-transparent"
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
          onClick={onGenerate} 
          disabled={isWorking || !topic}
          className="ml-auto bg-black text-white px-6 py-1.5 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isWorking ? "Wait..." : "Go"}
        </button>
      </div>
    </div>
  );
}
