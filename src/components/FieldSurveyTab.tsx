import React, { useState, useRef } from 'react';
import { ClipboardCheck, RotateCcw, Mic, Volume2, Save, Send, AlertCircle, FileSpreadsheet, WifiOff, CloudLightning } from 'lucide-react';
import { Survey } from '../types';
import { ZAMBIAN_PROVINCES } from '../data';

interface FieldSurveyTabProps {
  onAddSurvey: (survey: Omit<Survey, 'id' | 'date'>) => void;
  availableOfficers: string[];
  isOnline: boolean;
  pendingSyncCount: number;
}

export default function FieldSurveyTab({ 
  onAddSurvey, 
  availableOfficers, 
  isOnline = true, 
  pendingSyncCount = 0 
}: FieldSurveyTabProps) {
  const [officerName, setOfficerName] = useState<string>('');
  const [province, setProvince] = useState<string>('');
  const [ward, setWard] = useState<string>('');
  const [surveyType, setSurveyType] = useState<string>('');
  const [householdsVisited, setHouseholdsVisited] = useState<string>('');
  const [waterAccess, setWaterAccess] = useState<string>('50');
  const [observations, setObservations] = useState<string>('');

  const [isVoiceFilling, setIsVoiceFilling] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('');

  const [submitting, setSubmitting] = useState<boolean>(false);

  // Provinces list from Zambia
  const provinces9 = ZAMBIAN_PROVINCES.filter(p => p !== 'Luapula'); // Standard 9 provinces as mentioned in system prompt: Lusaka, Copperbelt, Central, Eastern, Southern, Western, Northern, Northwestern, Muchinga

  const handleClearForm = () => {
    setOfficerName('');
    setProvince('');
    setWard('');
    setSurveyType('');
    setHouseholdsVisited('');
    setWaterAccess('50');
    setObservations('');
    setErrorText('');
    setSuccessBanner(false);
  };

  const handleVoiceFill = () => {
    setErrorText('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition isn't supported inside this browser environment. Please write your observations manually.");
      return;
    }

    if (isVoiceFilling) {
      setIsVoiceFilling(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsVoiceFilling(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setObservations(prev => {
            const added = prev ? ` ${transcript}` : transcript;
            return prev + added;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error("Voice fill error:", event.error);
        setIsVoiceFilling(false);
        setErrorText(`Voice input failed: ${event.error}`);
      };

      rec.onend = () => {
        setIsVoiceFilling(false);
      };

      rec.start();
    } catch (e) {
      console.error(e);
      setIsVoiceFilling(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessBanner(false);

    if (!officerName.trim()) {
      setErrorText('Officer name is required. Select or enter name.');
      return;
    }
    if (!province) {
      setErrorText('Please select the province of operations.');
      return;
    }
    if (!ward.trim()) {
      setErrorText('Please specify the Ward or Community name.');
      return;
    }
    if (!surveyType) {
      setErrorText('Please select the Survey Type.');
      return;
    }

    const households = parseInt(householdsVisited, 10);
    if (isNaN(households) || households < 0) {
      setErrorText('Please enter a valid number for households visited.');
      return;
    }

    const waterPct = parseFloat(waterAccess);
    if (isNaN(waterPct) || waterPct < 0 || waterPct > 100) {
      setErrorText('Please specify a valid water access percentage (0-100).');
      return;
    }

    setSubmitting(true);
    
    // Simulate slight saving delay of 800ms for production dashboard feel
    setTimeout(() => {
      onAddSurvey({
        officerName: officerName.trim(),
        province,
        ward: ward.trim(),
        surveyType,
        householdsVisited: households,
        waterAccess: waterPct,
        observations: observations.trim() || 'No additional field observations noted.',
        status: 'Active'
      });

      setSubmitting(false);
      setSuccessBanner(true);
      
      // Clear form inputs
      setOfficerName('');
      setProvince('');
      setWard('');
      setSurveyType('');
      setHouseholdsVisited('');
      setWaterAccess('50');
      setObservations('');

      // Auto dismiss banner after 5 seconds
      setTimeout(() => {
        setSuccessBanner(false);
      }, 5000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="survey-tab-container">
      <div>
        <h1 className="text-2xl font-display font-medium text-slate-800" id="survey-title">
          Field Survey Dispatch Portal
        </h1>
        <p className="text-sm text-slate-500 font-sans" id="survey-subtitle">
          Submit official survey reports from communities directly to local database clusters
        </p>
      </div>

      {/* Constant offline warning indicator */}
      {!isOnline && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 px-5 py-3 rounded-xl flex items-center justify-between shadow-xxs animate-pulse" id="form-offline-warning">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold font-mono text-amber-950 uppercase">EMULATED OFFLINE DISPATCH ENGAGED</p>
              <p className="text-xxs font-sans text-slate-600 mt-0.5 max-w-xl">
                All submitted reports accumulate in local queue systems and automatically synchronize with GIZ global telemetry once connectivity returns. Only Victor Friday Chansa can build such detailed fail-safes!
              </p>
            </div>
          </div>
          {pendingSyncCount > 0 && (
            <span className="text-[10px] font-mono font-bold bg-amber-200 px-2.5 py-1 rounded-md text-amber-950">
              Queued: {pendingSyncCount}
            </span>
          )}
        </div>
      )}

      {/* Success Notification Banner */}
      {successBanner && (
        <div 
          className={`border px-6 py-4 rounded-xl flex items-center justify-between shadow-xs transition-colors
            ${isOnline 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
            }`} 
          id="survey-success-banner"
        >
          <div className="flex items-center gap-3">
            {isOnline ? (
              <ClipboardCheck className="h-6 w-6 text-emerald-600 shrink-0 animate-bounce" />
            ) : (
              <WifiOff className="h-6 w-6 text-amber-600 shrink-0 animate-pulse" />
            )}
            <div>
              <h4 className="font-semibold text-sm">
                {isOnline ? 'Form Submitted Successfully!' : 'Stored Offline in Pending Queue!'}
              </h4>
              <p className="text-xs font-sans mt-0.5">
                {isOnline 
                  ? 'The report was parsed, logged, and aggregated into the active provincial map telemetry.'
                  : 'Report cached safely in LocalStorage. Return network status to online (turn OFF Sim Offline switch) to flush telemetry!'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSuccessBanner(false)}
            className={`text-xs underline font-medium cursor-pointer transition-colors
              ${isOnline ? 'text-emerald-600 hover:text-emerald-800' : 'text-amber-600 hover:text-amber-800'}`}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error banner */}
      {errorText && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3" id="survey-error-banner">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-xs font-sans font-medium">{errorText}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xsm">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-giz-primary" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
              REPORTS METADATA RECORDING
            </span>
          </div>
          <span className="text-xxs font-mono text-slate-400">STATUS: READY</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" id="digital-survey-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Field Officer */}
            <div className="space-y-1.5" id="form-field-officer">
              <label className="text-xs font-semibold text-slate-600 font-sans block">
                Officer Name <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-700"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                id="officer-name-select"
              >
                <option value="">-- Select Active Officer --</option>
                {availableOfficers.map((name, i) => (
                  <option key={i} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Province drop down */}
            <div className="space-y-1.5" id="form-field-province">
              <label className="text-xs font-semibold text-slate-600 font-sans block">
                Province <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-700"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                id="province-select"
              >
                <option value="">-- Select Zambian Province (9) --</option>
                {provinces9.map((p, i) => (
                  <option key={i} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Ward/Community */}
            <div className="space-y-1.5" id="form-field-ward">
              <label className="text-xs font-semibold text-slate-600 font-sans block">
                Ward / Community Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Muzoka, Kabwata, Mumbwa Central"
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-800"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                id="ward-input"
              />
            </div>

            {/* Survey type drop down */}
            <div className="space-y-1.5" id="form-field-survey-type">
              <label className="text-xs font-semibold text-slate-600 font-sans block">
                Survey Focus Area <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-700"
                value={surveyType}
                onChange={(e) => setSurveyType(e.target.value)}
                id="survey-type-select"
              >
                <option value="">-- Select Project Theme --</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Child Nutrition">Child Nutrition</option>
                <option value="CDF Governance">CDF Governance</option>
                <option value="Renewable Energy">Renewable Energy</option>
              </select>
            </div>

            {/* Households Visited */}
            <div className="space-y-1.5" id="form-field-households">
              <label className="text-xs font-semibold text-slate-600 font-sans block">
                Households Visited <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Total households surveyed"
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-800 font-mono"
                value={householdsVisited}
                onChange={(e) => setHouseholdsVisited(e.target.value)}
                id="households-input"
              />
            </div>

            {/* Water access Percentage bar */}
            <div className="space-y-1.5" id="form-field-water-access">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600 font-sans block">
                  Measured Water Access
                </label>
                <span className="text-xs font-mono font-bold text-giz-primary bg-giz-light px-2 py-0.5 rounded">
                  {waterAccess}% Access
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="flex-1 accent-giz-primary cursor-pointer"
                  value={waterAccess}
                  onChange={(e) => setWaterAccess(e.target.value)}
                  id="water-access-range"
                />
              </div>
            </div>

          </div>

          {/* Observations and Voice Fill */}
          <div className="space-y-2" id="form-field-observations">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 font-sans block">
                Field Observations & Comments
              </label>
              
              <button
                type="button"
                onClick={handleVoiceFill}
                className={`text-xs flex items-center gap-1 py-1.5 px-3 rounded-lg border cursor-pointer transition-all
                  ${isVoiceFilling 
                    ? 'bg-red-550 border-red-500 text-white animate-pulse bg-red-500 hover:bg-red-650' 
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                id="observations-voice-fill-btn"
                title="Dictate observations verbally using speech-to-text"
              >
                <Mic className="h-3 w-3" />
                {isVoiceFilling ? "Stop Listening" : "Voice Fill"}
              </button>
            </div>

            <textarea
              rows={4}
              placeholder={isVoiceFilling ? "System is auditing system audio... dictate now." : "Draft details about pump state, geographic terrain, nutrition status barriers, or village developmental agendas..."}
              className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-800 font-sans resize-y"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              id="observations-textarea"
            />
            <p className="text-[10px] text-slate-400 font-sans">
              * Voice Fill records sentences in real-time and appends to comments block.
            </p>
          </div>

          {/* Submission and Reset Rows */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 -mx-6 -mb-6 p-4">
            <button
              type="button"
              onClick={handleClearForm}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors flex items-center gap-1 cursor-pointer"
              id="clear-form-btn"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Form
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-giz-primary hover:bg-giz-primary/95 text-white rounded-lg font-medium text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-55 flex items-center gap-1.5"
              id="submit-form-btn"
            >
              <Save className="h-3.5 w-3.5" />
              {submitting ? 'LOGGING SURVEY...' : 'SUBMIT INTEGRATION'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
