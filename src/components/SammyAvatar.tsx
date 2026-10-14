import React, { useEffect, useState } from 'react';

interface SammyAvatarProps {
  state: 'idle' | 'listening' | 'speaking' | 'thinking';
  isTyping?: boolean;
}

export default function SammyAvatar({ state, isTyping = false }: SammyAvatarProps) {
  // We can also cycle random tiny micro-idle states (like shifts in posture or gaze direction) to feel organic
  const [microIdleState, setMicroIdleState] = useState<'normal' | 'glance-left' | 'glance-right' | 'gaze-up'>('normal');

  useEffect(() => {
    if (state !== 'idle') return;
    
    // Cycle random gaze points more frequently so she looks "alive" and interactive
    const interval = setInterval(() => {
      const states: ('normal' | 'glance-left' | 'glance-right' | 'gaze-up')[] = [
        'normal', 'glance-left', 'normal', 'glance-right', 'normal', 'gaze-up'
      ];
      const randomState = states[Math.floor(Math.random() * states.length)];
      setMicroIdleState(randomState);
    }, 2800); // Look around every 2.8 seconds

    return () => clearInterval(interval);
  }, [state]);

  // Handle pupil position values based on active state
  let pupilTranslateX = '0px';
  let pupilTranslateY = '0px';

  if (isTyping) {
    // Looking down quite clearly at the user's input keys
    pupilTranslateX = '0px';
    pupilTranslateY = '2.2px';
  } else if (state === 'listening') {
    // Direct, attentive eye contact
    pupilTranslateX = '0px';
    pupilTranslateY = '0.5px';
  } else if (state === 'thinking') {
    // Calculating - eyes look slightly upward-left
    pupilTranslateX = '-1.5px';
    pupilTranslateY = '-2px';
  } else if (state === 'idle') {
    if (microIdleState === 'glance-left') {
      pupilTranslateX = '-2px';
      pupilTranslateY = '0px';
    } else if (microIdleState === 'glance-right') {
      pupilTranslateX = '2px';
      pupilTranslateY = '0px';
    } else if (microIdleState === 'gaze-up') {
      pupilTranslateX = '0px';
      pupilTranslateY = '-1.8px';
    }
  }

  // Handle head tilt/rotation slightly
  let headTransform = 'rotate(0deg) translateY(0px)';
  if (isTyping) {
    headTransform = 'rotate(1deg) translateY(1.5px)'; // look down slightly
  } else if (state === 'listening') {
    headTransform = 'rotate(-1.5deg) translateY(0.5px)'; // side tilt
  } else if (state === 'thinking') {
    headTransform = 'rotate(1.5deg) translateY(-0.5px)'; // thoughtful posture
  }

  return (
    <div className="relative flex items-center justify-center p-1.5 bg-gradient-to-b from-slate-100 to-slate-200/50 rounded-full border border-slate-300/40 shadow-inner overflow-hidden select-none" id="sammy-animated-avatar-wrapper" style={{ width: '130px', height: '130px' }}>
      
      {/* Background soft, elegant ambient energy wave for reactive states */}
      <div className={`absolute inset-0 rounded-full opacity-20 transition-all duration-1000
        ${state === 'listening' ? 'bg-emerald-450 bg-emerald-500 scale-105' : ''}
        ${state === 'thinking' ? 'bg-amber-450 bg-amber-500 scale-100' : ''}
        ${state === 'speaking' ? 'bg-[#1D9E75] scale-110' : 'bg-slate-300/10'}
      `} />

      {/* Exquisite Human Female Vector Avatar */}
      <svg
        viewBox="0 0 120 120"
        className="w-28 h-28 z-10 transition-transform duration-500"
        id="sammy-vector-avatar-canvas"
      >
        <defs>
          {/* Stunning Skin tone soft radial gradients to add depth */}
          <radialGradient id="faceSkinGrad" cx="50%" cy="40%" r="55%" fx="45%" fy="35%">
            <stop offset="0%" stopColor="#DF9F82" />
            <stop offset="70%" stopColor="#C9815F" />
            <stop offset="100%" stopColor="#AD6645" />
          </radialGradient>

          <linearGradient id="neckSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#AD6645" />
            <stop offset="100%" stopColor="#8A4A2B" />
          </linearGradient>

          {/* Premium hair color depth with gold-brass custom highlights for elegant contrast */}
          <linearGradient id="hairBaseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B1716" />
            <stop offset="40%" stopColor="#2E231F" />
            <stop offset="85%" stopColor="#1D1512" />
            <stop offset="100%" stopColor="#0D0A09" />
          </linearGradient>

          <linearGradient id="hairHighlightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7B502C" />
            <stop offset="50%" stopColor="#A2714B" />
            <stop offset="100%" stopColor="#7B502C" />
          </linearGradient>

          {/* Glossy lipstick tones */}
          <linearGradient id="lipsGrad" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#C85350" />
            <stop offset="50%" stopColor="#E06967" />
            <stop offset="100%" stopColor="#9C3432" />
          </linearGradient>

          {/* Recruiter blazer GIZ Corporate green */}
          <linearGradient id="blazerCorpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#11755C" />
            <stop offset="100%" stopColor="#094B3A" />
          </linearGradient>

          {/* Eye shadow makeup gradient */}
          <radialGradient id="eyeshadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2F1C1C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C9815F" stopOpacity="0" />
          </radialGradient>

          {/* Animation schemas */}
          <style>{`
            @keyframes softBreathe {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-0.8px) scale(1.005); }
            }
            @keyframes fastBlink {
              0%, 92%, 100% { transform: scaleY(1); }
              96% { transform: scaleY(0.15); }
            }
            @keyframes speechSpeakPath {
              0%, 100% { d: path("M 53 72 Q 60 72 67 72"); }
              15% { d: path("M 52 71 Q 60 82 68 71"); }
              35% { d: path("M 53 72 Q 60 75 67 72"); }
              55% { d: path("M 51 70 Q 60 84 69 70"); }
              75% { d: path("M 53 72 Q 60 78 67 72"); }
              90% { d: path("M 52 71 Q 60 80 68 71"); }
            }
            @keyframes listenReact {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(0.4px); }
            }

            .eyelid-group {
              animation: fastBlink 5s infinite ease-in-out;
            }
            .left-lid { transform-origin: 45px 48px; }
            .right-lid { transform-origin: 75px 48px; }

            .avatar-body {
              animation: softBreathe 4s infinite ease-in-out;
            }
            .state-listening .avatar-body {
              animation: listenReact 1.5s infinite ease-in-out;
            }

            .mouth-active {
              animation: speechSpeakPath 0.22s infinite ease-in-out;
            }
          `}</style>
        </defs>

        {/* Global Body containing subtle continuous breathing motions */}
        <g className="avatar-body" style={{ transformOrigin: '60px 110px' }}>
          
          {/* Background hair overflow for nice thick elegant layout (Rear hair) */}
          <path
            d="M 30 50 C 12 40, 10 90, 32 94 C 20 75, 24 55, 32 50 Z"
            fill="url(#hairBaseGrad)"
          />
          <path
            d="M 90 50 C 108 40, 110 90, 88 94 C 100 75, 96 55, 88 50 Z"
            fill="url(#hairBaseGrad)"
          />

          {/* Shoulders & Clothing with blazer structure */}
          {/* Underlayer light cream top representing professional style */}
          <path d="M 45 83 L 60 102 L 75 83 Z" fill="#FBF9F6" />
          <path d="M 46 84 L 60 104 L 74 84 Z" fill="#E6DFD5" />

          {/* Premium GIZ Lanyard strap */}
          <path d="M 48 83 L 60 100 L 72 83" fill="none" stroke="#E2001A" strokeWidth="2.5" />
          <path d="M 48.5 83 L 60 99 L 71.5 83" fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeDasharray="2,2" />

          {/* ID Card Holder hanging neatly */}
          <rect x="54.5" y="99" width="11" height="14" rx="1.5" fill="#FFFFFF" stroke="#094B3A" strokeWidth="0.8" />
          <rect x="56.5" y="101" width="7" height="1.8" fill="#E2001A" />
          <circle cx="60" cy="107.5" r="1.5" fill="#11755C" />
          <line x1="56.5" y1="110" x2="63.5" y2="110" stroke="#8A4A2B" strokeWidth="0.6" />

          {/* Corporate GIZ Green Blazer jacket with nice folding lines */}
          <path
            d="M 22 108 C 22 93, 34 84, 46 84 L 54 108 L 22 108 Z"
            fill="url(#blazerCorpGrad)"
          />
          <path
            d="M 98 108 C 98 93, 86 84, 74 84 L 66 108 L 98 108 Z"
            fill="url(#blazerCorpGrad)"
          />

          {/* Neat Golden brooch on left lapel for recruiter female feel */}
          <circle cx="36" cy="94" r="2.8" fill="#D3A74A" />
          <circle cx="36" cy="94" r="1.8" fill="#FFFFFF" className="opacity-80" />

          {/* Neck with soft anatomical shading */}
          <path d="M 51 72 L 51 86 L 69 86 L 69 72 Z" fill="url(#neckSkinGrad)" />
          {/* Throat shadow overlap */}
          <path d="M 51 72 C 55 76, 65 76, 69 72 Z" fill="#8A4A2B" className="opacity-80" />

          {/* Head Tilt Group */}
          <g style={{ transform: headTransform, transformOrigin: '60px 75px', transition: 'transform 0.4s ease-out' }}>
            
            {/* Elegant ears with shiny jewelry */}
            <circle cx="31" cy="53" r="5.2" fill="#AD6645" />
            <circle cx="89" cy="53" r="5.2" fill="#AD6645" />
            {/* Beautiful shiny gold hoop earrings */}
            <circle cx="30" cy="56" r="3" fill="none" stroke="#D3A74A" strokeWidth="1.6" />
            <circle cx="90" cy="56" r="3" fill="none" stroke="#D3A74A" strokeWidth="1.6" />

            {/* Beautiful Face Oval - symmetrical and professional */}
            <path
              d="M 33 48 C 33 26, 87 26, 87 48 C 87 69, 81 77, 60 77 C 39 77, 33 69, 33 48 Z"
              fill="url(#faceSkinGrad)"
            />

            {/* Cheek rouges for glowing layout */}
            <ellipse cx="39" cy="58" rx="6.5" ry="3.5" fill="#C43B33" className="opacity-25" />
            <ellipse cx="81" cy="58" rx="6.5" ry="3.5" fill="#C43B33" className="opacity-25" />

            {/* Advanced Hair Construction (Layered curly twists - gorgeous volumetric hair crown) */}
            {/* Main high puff buns with rich highlights */}
            <g id="crown-puffs">
              <circle cx="44" cy="22" r="14" fill="url(#hairBaseGrad)" />
              <circle cx="43" cy="21" r="11" fill="none" stroke="url(#hairHighlightGrad)" strokeWidth="1.5" className="opacity-60" />

              <circle cx="76" cy="22" r="14" fill="url(#hairBaseGrad)" />
              <circle cx="77" cy="21" r="11" fill="none" stroke="url(#hairHighlightGrad)" strokeWidth="1.5" className="opacity-60" />

              <circle cx="60" cy="18" r="15" fill="url(#hairBaseGrad)" />
              <circle cx="60" cy="17" r="12" fill="none" stroke="url(#hairHighlightGrad)" strokeWidth="1.8" className="opacity-70" />
            </g>

            {/* Delicate framing hair locks on the side/temples */}
            <path d="M 33 40 C 31 46, 31 52, 32 58" fill="none" stroke="url(#hairBaseGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 87 40 C 89 46, 89 52, 88 58" fill="none" stroke="url(#hairBaseGrad)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Symmetrical hairline curve covering forehead elegantly */}
            <path
              d="M 32 40 C 44 28, 52 30, 60 31 C 68 30, 76 28, 88 40 C 82 32, 60 32, 32 40 Z"
              fill="url(#hairBaseGrad)"
            />

            {/* Makeup eyeshadow backdrop */}
            <ellipse cx="45" cy="47.5" rx="7.5" ry="4.5" fill="url(#eyeshadow)" />
            <ellipse cx="75" cy="47.5" rx="7.5" ry="4.5" fill="url(#eyeshadow)" />

            {/* Eye lashes / sleek modern eyelids */}
            <path d="M 38 46 C 41 43, 49 43, 52 46" fill="none" stroke="#100A09" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 68 46 C 71 43, 79 43, 82 46" fill="none" stroke="#100A09" strokeWidth="2.5" strokeLinecap="round" />

            {/* Eyebrows - beautifully curved, tapered and matching the hair tone */}
            <path d="M 37 41.5 Q 45 37 51 41" fill="none" stroke="#100A09" strokeWidth="2" strokeLinecap="round" />
            <path d="M 69 41 T 75 37 Q 83 41.5 83 41.5" fill="none" stroke="#100A09" strokeWidth="2" strokeLinecap="round" />

            {/* Glowing Eyes structure with detailed pupils */}
            {/* Left Eye */}
            <g className="eyelid-group left-lid">
              <ellipse cx="45" cy="47.5" rx="6" ry="4" fill="#FFFFFF" />
              {/* Pupil with active positioning based on states */}
              <g style={{ transform: `translate(${pupilTranslateX}, ${pupilTranslateY})`, transition: 'transform 0.2s ease-out' }}>
                <circle cx="45" cy="47.5" r="3" fill="#4B3323" />
                <circle cx="45" cy="47.5" r="1.5" fill="#1C1109" />
                {/* Beautiful eye reflection star sparkle */}
                <circle cx="46.5" cy="46" r="0.9" fill="#FFFFFF" />
                <circle cx="43.8" cy="49" r="0.4" fill="#FFFFFF" className="opacity-80" />
              </g>
            </g>

            {/* Right Eye */}
            <g className="eyelid-group right-lid">
              <ellipse cx="75" cy="47.5" rx="6" ry="4" fill="#FFFFFF" />
              {/* Pupil with active positioning based on states */}
              <g style={{ transform: `translate(${pupilTranslateX}, ${pupilTranslateY})`, transition: 'transform 0.2s ease-out' }}>
                <circle cx="75" cy="47.5" r="3" fill="#4B3323" />
                <circle cx="75" cy="47.5" r="1.5" fill="#1C1109" />
                {/* Beautiful eye reflection star sparkle */}
                <circle cx="76.5" cy="46" r="0.9" fill="#FFFFFF" />
                <circle cx="73.8" cy="49" r="0.4" fill="#FFFFFF" className="opacity-80" />
              </g>
            </g>

            {/* Smart Digital Glasses (Premium red-gold thin metallic round rim glasses) */}
            <circle cx="45" cy="47.5" r="9.2" fill="none" stroke="#D3A74A" strokeWidth="0.8" />
            <circle cx="45" cy="47.5" r="8.4" fill="none" stroke="#E2001A" strokeWidth="1" />

            <circle cx="75" cy="47.5" r="9.2" fill="none" stroke="#D3A74A" strokeWidth="0.8" />
            <circle cx="75" cy="47.5" r="8.4" fill="none" stroke="#E2001A" strokeWidth="1" />

            {/* Bridge connection */}
            <path d="M 54.2 46.5 Q 60 48.5 65.8 46.5" fill="none" stroke="#D3A74A" strokeWidth="1.5" />
            {/* Side wings */}
            <path d="M 35.8 46 Q 32 44.5 32 44.5" fill="none" stroke="#E2001A" strokeWidth="1.2" />
            <path d="M 84.2 46 Q 88 44.5 88 44.5" fill="none" stroke="#E2001A" strokeWidth="1.2" />

            {/* Slim, cute, elegant feminine nose */}
            <path d="M 60 51.5 L 59 58 Q 60 61 61.5 58.5" fill="none" stroke="#8A4A2B" strokeWidth="1.2" strokeLinecap="round" />

            {/* Dynamic luscious glossy mouth */}
            {state === 'speaking' ? (
              <path
                d="M 53 71 Q 60 81 67 71"
                fill="url(#lipsGrad)"
                stroke="#731918"
                strokeWidth="1.2"
                className="mouth-active"
              />
            ) : (
              // Warm natural dual-lips smile
              <g>
                {/* Top Lip definition */}
                <path d="M 51 68 Q 55 66.5 60 68 Q 65 66.5 69 68 Q 60 70 51 68 Z" fill="#9C3432" />
                {/* Bottom Lip juicy shine */}
                <path d="M 51 68 Q 60 74 69 68 Q 60 76 51 68 Z" fill="url(#lipsGrad)" />
                {/* Soft center shine highlight bar */}
                <path d="M 56 70.2 Q 60 71.5 64 70.2" fill="none" stroke="#FFCECE" strokeWidth="0.8" className="opacity-80" />
              </g>
            )}

          </g>
        </g>
      </svg>

      {/* Mic soundwave ripple overlay when the user is speaking to her (listening/active state) */}
      {state === 'listening' && (
        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-25 z-0" style={{ animationDuration: '1.6s' }} />
      )}
    </div>
  );
}
