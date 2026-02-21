'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // เช็คว่า Browser รองรับ Speech Recognition ไหม
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recog = new SpeechRecognition();
      
      recog.lang = 'th-TH'; // ภาษาไทย
      recog.continuous = false; // ฟังประโยคเดียวจบ
      recog.interimResults = false; // ไม่เอาข้อความระหว่างพูด (เอาตอนจบทีเดียว)

      recog.onstart = () => {
        setIsListening(true);
        setAnswer("กำลังฟัง... พูดได้เลยครับ");
      };
      
      recog.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        console.log("ได้ยินว่า:", text); // Debug ดูใน Console
        setTranscript(text);
        
        // หยุดฟังแล้วส่งข้อมูลทันที
        setIsListening(false); 
        handleVoiceSearch(text);
      };

      recog.onerror = (event: any) => {
        console.error("Speech Error:", event.error);
        setIsListening(false);
        setAnswer("เกิดข้อผิดพลาดในการรับเสียง: " + event.error);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      setAnswer("Browser ของคุณไม่รองรับฟีเจอร์นี้ครับ");
    }
  }, []);

  const handleVoiceSearch = async (text: string) => {
    setAnswer("กำลังติดต่อ n8n AI...");
    setItems([]); // เคลียร์ข้อมูลเก่า

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      console.log("API ตอบกลับ:", data); // Debug ดูผลลัพธ์

      if (data.error) {
        setAnswer("Error: " + data.error);
      } else {
        setAnswer(data.answer);
        if (data.matches) setItems(data.matches);
      }
    } catch (err: any) {
      console.error(err);
      setAnswer("เชื่อมต่อไม่ได้: " + err.message);
    }
  };

  const startListening = (e: any) => {
    // *** สำคัญมาก: บรรทัดนี้ป้องกันหน้าเว็บรีโหลด ***
    e.preventDefault(); 

    if (recognition) {
      setTranscript("");
      setAnswer("");
      setItems([]);
      try {
        recognition.start();
      } catch (error) {
        console.log("Mic already active");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-10 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">🪐 สารานุกรมอวกาศ AI</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700">
        
        <form className="flex justify-center mb-6">
          <button
            // ใส่ type="button" เพื่อความชัวร์ว่าไม่ submit form
            type="button" 
            onClick={startListening}
            disabled={isListening}
            className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all transform hover:scale-105 ${
              isListening 
                ? 'bg-red-500 animate-pulse cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {isListening ? 'กำลังฟังเสียง...' : '🎙️ กดเพื่อถาม'}
          </button>
        </form>

        <div className="mb-6 space-y-2">
          <label className="text-gray-400 text-sm">คุณถามว่า:</label>
          <div className="w-full p-4 bg-gray-700 rounded-lg min-h-[60px] border border-gray-600 text-lg">
            {transcript || <span className="text-gray-500 italic">...รอรับคำสั่ง...</span>}
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <label className="text-gray-400 text-sm">AI ตอบว่า:</label>
          <div className="w-full p-4 bg-indigo-900/50 rounded-lg min-h-[100px] border border-indigo-500/30 whitespace-pre-line leading-relaxed">
            {answer || <span className="text-gray-500 italic">- คำตอบจะปรากฏที่นี่ -</span>}
          </div>
        </div>

        {/* แสดงการ์ดข้อมูลดวงดาว */}
        {items.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4 animate-fade-in">
            <h3 className="font-semibold text-blue-300 mb-3">✨ ข้อมูลที่พบ:</h3>
            <div className="space-y-3">
              {items.map((item: any, i) => (
                <div key={i} className="p-3 bg-gray-700/50 border border-gray-600 rounded hover:bg-gray-700 transition">
                  <div className="flex justify-between items-center">
                    <strong className="text-lg text-white">{item.name}</strong>
                    <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">{item.type}</span>
                  </div>
                  <p className="text-gray-300 mt-2 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}