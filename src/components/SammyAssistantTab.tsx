import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Key, Sparkles, Volume2, VolumeX, RefreshCw, AlertCircle } from 'lucide-react';
import { Message } from '../types';
import { SYSTEM_PROMPT } from '../data';
import SammyAvatar from './SammyAvatar';

interface SammyAssistantTabProps {
  onAddSystemSurveyExplanation?: string;
}

export default function SammyAssistantTab({ onAddSystemSurveyExplanation }: SammyAssistantTabProps) {
  const [apiMode, setApiMode] = useState<'cloud' | 'offline'>('cloud');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  
  // States: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  
  const [isListening, setIsListening] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load saved mode on boot
  useEffect(() => {
    const savedMode = localStorage.getItem('giz_api_mode');
    if (savedMode === 'cloud' || savedMode === 'offline') {
      setApiMode(savedMode);
    } else {
      setApiMode('cloud');
    }

    // Load welcome message
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Halo! I am Sammy, your field intelligence assistant for GIZ Zambia. I can answer questions about local water access, regional child nutrition statuses, or active survey pipelines. How can I assist you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Sync scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, assistantState]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setAssistantState('listening');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        setAssistantState('idle');
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Grant permissions in settings.');
        } else {
          setErrorMessage(`Speech input failed: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        setAssistantState(prev => prev === 'listening' ? 'idle' : prev);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text-to-speech speaker helper
  const speakResponse = (text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      // Remove URLs, bracketed texts for cleaner narration
      const cleanedText = text
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\[.*?\]/g, '')
        .substring(0, 300); // capped speak duration

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      const voices = window.speechSynthesis.getVoices();
      
      // Look for a pleasant English female voice (Zira, Samantha, Karen, Google US English, etc.)
      const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
      
      const femaleKeywords = ['female', 'zira', 'karen', 'samantha', 'moira', 'hazel', 'susan', 'tessa', 'fiona', 'veena', 'en-us-wd', 'english (united states)'];
      let selectedVoice = englishVoices.find(v => 
        femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
      );
      
      if (!selectedVoice) {
        selectedVoice = englishVoices.find(v => v.name.toLowerCase().includes('google'));
      }
      if (!selectedVoice) {
        selectedVoice = englishVoices[0];
      }
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = 1.05;
      utterance.pitch = 1.15; // Set bright, friendly female-sounding tone

      utterance.onstart = () => {
        setAssistantState('speaking');
      };
      utterance.onend = () => {
        setAssistantState('idle');
      };
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setAssistantState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech engine failure:', e);
      setAssistantState('idle');
    }
  };

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition isn't supported inside this browser environment. Please write your request below.");
      return;
    }

    setErrorMessage('');
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Start speech failed", e);
      }
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Halo! Chat history wiped. Sammy is ready to analyze fresh community datasets. Ask away!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setAssistantState('idle');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const getEmojiForState = () => {
    switch (assistantState) {
      case 'listening': return '👂';
      case 'thinking': return '🤔';
      case 'speaking': return '🗣️';
      default: return '🤖';
    }
  };

  const getStatusLabel = () => {
    switch (assistantState) {
      case 'listening': return 'Listening...';
      case 'thinking': return 'Analyzing metrics...';
      case 'speaking': return 'Speaking insight...';
      default: return 'Sammy is Online';
    }
  };

  // Predefined smart responses fallback for beautiful Demo/Test Mode
  const getSimulatedResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes('victor') || q.includes('chansa') || q.includes('hire') || q.includes('developer')) {
      return "Victor Friday Chansa is an outstanding full-stack software engineer who built this high-fidelity telemetry dashboard using React, Vite, TypeScript, Tailwind CSS, and Web Speech voice narration! He is applying for an internship or job at GIZ Zambia. He brings technical agility, local developmental insight, and a strong drive for digital transformation. You should absolutely hire him to join your team! Please explore his credentials inside his dedicated portfolio.";
    }
    if (q.includes('lowest') || q.includes('water access') || q.includes('lowest water')) {
      return "The provinces with the lowest water access in Zambia are Northern Province (37% access) and Muchinga Province (39% access). Western Province is also low at 41%. These regions are red-flagged for urgent borehole deployments and community infrastructure fund budgeting.";
    }
    if (q.includes('march') || q.includes('nutrition') || q.includes('dip') || q.includes('assessment')) {
      return "In March, child nutrition assessments dropped to 450 (from 520 in February). This dip was flagged in amber as a potential seasonal harvest gap. Thankfully, numbers rebounded swiftly to 610 in April following nutrition taskforce intervention.";
    }
    if (q.includes('active') || q.includes('surveys') || q.includes('survey')) {
      return "We have 4 critical survey tracks active: 1) 'Water & Sanitation' in Southern monitored by M. Banda (247 responses), 2) 'Child Nutrition' in Eastern overseen by C. Phiri (183 responses), 3) 'CDF Governance' in Lusaka led by T. Mwale (91 pending), and 4) 'Renewable Energy' in Northwestern (Upcoming deployment).";
    }
    if (q.includes('urgent') || q.includes('areas') || q.includes('attention')) {
      return "Urgent priority areas include Northern and Muchinga provinces due to critical water access under 40%. Additionally, rural nutrition assessments in Eastern Province require continuous focus to sustain the post-March recovery pipeline.";
    }
    return "As Sammy, I've cross-referenced our records. GIZ Zambia has currently tracked 1,284 communities, registered 3,741 surveys across 9 provinces with an average 64% water access rate. Let me know if you would like me to detail a specific survey or province!";
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    setInputValue('');
    setErrorMessage('');

    const userMessage: Message = {
      id: `m-usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setAssistantState('thinking');

    const activeMode = localStorage.getItem('giz_api_mode') || 'cloud';

    if (activeMode === 'offline') {
      // Offline mode / cache simulation
      setTimeout(() => {
        const replyText = getSimulatedResponse(text);
        const replyMsg: Message = {
          id: `m-ast-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, replyMsg]);
        setAssistantState('speaking');
        speakResponse(replyText);
      }, 1000);
    } else {
      // Real Server-Side Google Gemini API Call
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP Error Status ${response.status}`);
        }

        const data = await response.json();
        const replyText = data.text || 'No response recorded.';
        
        const replyMsg: Message = {
          id: `m-ast-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, replyMsg]);
        setAssistantState('speaking');
        speakResponse(replyText);
      } catch (err: any) {
        console.error("Gemini server proxy error:", err);
        setErrorMessage(`Server offline or request limit reached. Defaulting to Sammy offline cache...`);
        
        // Graceful fallback to offline local simulation so the dashboard is highly robust
        setTimeout(() => {
          const backupText = `[Offline Cache Fallback] ${getSimulatedResponse(text)}`;
          const replyMsg: Message = {
            id: `m-ast-fb-${Date.now()}`,
            role: 'assistant',
            content: backupText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, replyMsg]);
          setAssistantState('speaking');
          speakResponse(backupText);
        }, 1000);
      }
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in" id="sammy-agent-tab-container">
      
      {/* Sammy Interaction Controls Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Animated Circle Avatar Card */}
        <div id="sammy-avatar-card" className="bg-white border border-slate-100 p-6 rounded-xl flex flex-col items-center justify-center text-center space-y-6">
          <span className="text-xs font-mono font-semibold tracking-wider text-giz-primary uppercase">
            Voice Assistant Core
          </span>
          
          {/* Interactive Sammy Human Vector Avatar */}
          <SammyAvatar state={assistantState} isTyping={inputValue.length > 0} />

          <div className="space-y-1">
            <h2 className="text-xl font-display font-semibold text-slate-800" id="assistant-name-title">
              Sammy Assistant
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono" id="assistant-state-badge">
              <span className={`h-2 w-2 rounded-full 
                ${assistantState === 'listening' ? 'bg-red-500 animate-pulse' : ''}
                ${assistantState === 'thinking' ? 'bg-amber-500 animate-pulse' : ''}
                ${assistantState === 'speaking' ? 'bg-giz-secondary animate-pulse' : ''}
                ${assistantState === 'idle' ? 'bg-giz-primary' : ''}
              `}></span>
              <span className="text-slate-500 font-semibold uppercase">{getStatusLabel()}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-xs font-sans leading-relaxed">
            Equipped with Web Speech input & high fidelity audio reading, Sammy gives you voice-guided telemetry analytics rapidly.
          </p>

          {/* TTS Audio Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 border text-xs font-medium cursor-pointer transition-all
              ${audioEnabled 
                ? 'bg-giz-light border-giz-primary/30 text-giz-primary hover:bg-giz-light/80' 
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
              }`}
            id="toggle-voice-reading-button"
            title={audioEnabled ? "Disable speech synthesis" : "Enable speech synthesis"}
          >
            {audioEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                Speech Synthesis: Enabled
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-400" />
                Speech Synthesis: Muted
              </>
            )}
          </button>
        </div>

        {/* Digital Development Profile Sync Section */}
        <div id="sammy-settings-card" className="bg-white border border-slate-100 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Key className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-display font-medium text-slate-700">PWA Operational Profile</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xxs text-slate-500 leading-relaxed font-sans">
              To align with the <span className="font-semibold text-slate-600">Principles for Digital Development</span>, Sammy supports a twin-engine design: autonomous offline-cache or live cloud sync.
            </p>

            <div className="grid grid-cols-2 gap-2" id="sync-mode-selector">
              <button
                type="button"
                onClick={() => {
                  setApiMode('cloud');
                  localStorage.setItem('giz_api_mode', 'cloud');
                }}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  apiMode === 'cloud'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm'
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                ☁️ Live Cloud Sync
              </button>
              <button
                type="button"
                onClick={() => {
                  setApiMode('offline');
                  localStorage.setItem('giz_api_mode', 'offline');
                }}
                className={`py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  apiMode === 'offline'
                    ? 'bg-[#E1F5EE] border-giz-secondary/15 text-giz-primary shadow-sm'
                    : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                }`}
              >
                💾 Offline Cache
              </button>
            </div>

            {apiMode === 'cloud' ? (
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50 space-y-1" id="cloud-info-box">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-mono text-emerald-800 font-bold">LIVE GEMINI ROUTER ACTIVE</span>
                </div>
                <p className="text-[10px] text-emerald-700/80 font-sans leading-normal">
                  Connected to Google Cloud. Using server-side proxy encryption. Auto-grounds responses on local Zambia water indices.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#E1F5EE]/40 rounded-lg border border-giz-secondary/10 space-y-1" id="offline-info-box">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                  <span className="text-[10px] font-mono text-slate-700 font-bold">AUTONOMOUS OFFLINE CACHE</span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans leading-normal">
                  Operating purely locally. No active data requests or telemetry transmissions will be emitted for low-bandwidth zones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Sammy Chat Interface */}
      <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col h-[650px]" id="sammy-chat-window-card">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-giz-primary flex items-center justify-center text-sm font-semibold text-white font-display">
              S
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Sammy Intel stream</h3>
              <p className="text-xxs font-sans text-slate-400">Direct query feed with Google Gemini</p>
            </div>
          </div>
          
          <button
            onClick={handleClearChat}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 hover:shadow-xsm transition-all cursor-pointer"
            id="clear-chat-btn"
          >
            <RefreshCw className="h-3 w-3" />
            Clear
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" id="messages-panel">
          {messages.map((m) => {
            const isAsst = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${isAsst ? 'mr-auto items-start' : 'ml-auto flex-row-reverse items-end'}`}
                id={`message-bubble-${m.id}`}
              >
                {/* Small indicator */}
                {isAsst && (
                  <div className="h-7 w-7 rounded-lg bg-giz-light border border-giz-secondary/20 flex items-center justify-center text-xs text-giz-primary font-bold">
                    🤖
                  </div>
                )}
                
                <div className="space-y-1">
                  <div 
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xsm relative
                      ${isAsst 
                        ? 'bg-[#E1F5EE] text-[#0A4A39] rounded-tl-none border border-giz-primary/10' 
                        : 'bg-giz-primary text-white rounded-br-none'
                      }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    
                    {/* Speech speak toggle beside assistant bubble */}
                    {isAsst && m.id !== 'welcome' && (
                      <button 
                        onClick={() => speakResponse(m.content)}
                        className="absolute bottom-1 -right-7 p-1 bg-slate-50 text-slate-400 hover:text-giz-primary rounded border border-slate-100"
                        title="Re-speak message"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  
                  <div className={`text-[10px] font-mono text-slate-400 ${isAsst ? 'text-left pl-1' : 'text-right pr-1'}`}>
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {assistantState === 'thinking' && (
            <div className="flex gap-3 items-center mr-auto max-w-[80%]" id="sammy-typing-indicator">
              <div className="h-7 w-7 rounded-lg bg-giz-light border border-giz-secondary/20 flex items-center justify-center text-xs text-giz-primary font-bold animate-pulse">
                🤔
              </div>
              <div className="bg-slate-50 text-slate-400 text-xs rounded-xl px-4 py-3 flex items-center gap-1.5 border border-slate-100">
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="ml-1 select-none text-[10px] font-mono uppercase tracking-wider">Processing datasets</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Global error notifications inside chat tab */}
        {errorMessage && (
          <div className="mx-6 mb-3 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-start gap-2 border border-red-100" id="sammy-error-banner">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="px-6 py-3 bg-slate-50/40 border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {[
            { tag: "Why Hire Victor Chansa? 🎓", query: "Why should GIZ Zambia hire Victor Friday Chansa?" },
            { tag: "Lowest water access?", query: "Lowest water access?" },
            { tag: "March nutrition dip", query: "Can you explain the March nutrition dip?" },
            { tag: "Active surveys", query: "What are the active surveys running?" },
            { tag: "Urgent areas", query: "Which provinces/areas are currently urgent?" }
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickQuestion(chip.query)}
              disabled={assistantState === 'thinking'}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:border-giz-primary hover:text-giz-primary rounded-lg text-xs font-medium text-slate-600 transition-colors shrink-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:shadow-xsm text-[11px]"
              id={`chip-${idx}`}
            >
              {chip.tag}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-slate-100 bg-white" id="sammy-chat-input-row">
          <div className="flex items-center gap-2">
            {/* Microphone Button */}
            <button
              onClick={handleToggleVoiceInput}
              disabled={assistantState === 'thinking'}
              className={`p-3 rounded-xl cursor-pointer transition-all border shrink-0 flex items-center justify-center
                ${isListening 
                  ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                }`}
              id="talk-by-voice-btn"
              title={isListening ? "Stop listening" : "Speak to Sammy"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            {/* Texts Input Box */}
            <input
              type="text"
              placeholder={isListening ? "Listening... Speak naturally now." : "Type a request, or ask: 'Which area needs direct focus?'"}
              className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-giz-primary focus:bg-white text-slate-800 disabled:opacity-75"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              disabled={assistantState === 'thinking'}
              id="keyboard-prompt-input"
            />

            {/* Send button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || assistantState === 'thinking'}
              className="p-3 bg-giz-primary hover:bg-giz-primary/95 text-white rounded-xl transition-all font-medium flex items-center justify-center cursor-pointer shadow-sm shadow-giz-primary/10 disabled:opacity-40 disabled:pointer-events-none shrink-0"
              id="submit-prompt-btn"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-[10px] text-slate-400 font-sans">
              Press Enter ↵ or say "Lowest water access?"
            </span>
            <div className="text-[10px] text-slate-400 font-mono">
              DPG License: MIT
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
