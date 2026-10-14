import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Bot, 
  ClipboardList, 
  Map, 
  Users, 
  FileText, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

// Types and Initial datasets
import { TabType, Survey, FieldOfficer, ProvinceData } from './types';
import { 
  PROVINCES_INITIAL, 
  SURVEYS_INITIAL, 
  OFFICERS_INITIAL, 
  REPORTS_INITIAL 
} from './data';

// Component Views
import DashboardTab from './components/DashboardTab';
import SammyAssistantTab from './components/SammyAssistantTab';
import FieldSurveyTab from './components/FieldSurveyTab';
import WardMapTab from './components/WardMapTab';
import OfficersTab from './components/OfficersTab';
import ReportsTab from './components/ReportsTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [provincesState, setProvincesState] = useState<ProvinceData[]>(PROVINCES_INITIAL);
  const [surveysState, setSurveysState] = useState<Survey[]>(SURVEYS_INITIAL);
  const [officersState, setOfficersState] = useState<FieldOfficer[]>(OFFICERS_INITIAL);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Connectivity and Synchronization management States
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [pendingSyncQueue, setPendingSyncQueue] = useState<Omit<Survey, 'id' | 'date'>[]>([]);
  const [syncStatusBanner, setSyncStatusBanner] = useState<{ show: boolean; count: number } | null>(null);

  const effectiveOnline = isOnline && !simulatedOffline;

  // Load pending list from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem('giz_pending_surveys');
      if (cached) {
        setPendingSyncQueue(JSON.parse(cached));
      }
    } catch (e) {
      console.error("Failed to load local pending queue metadata:", e);
    }
  }, []);

  // Flush and synchronize all pending surveys with the main telemetry database
  const handleTriggerSync = (queueToSync: Omit<Survey, 'id' | 'date'>[]) => {
    if (queueToSync.length === 0) return;

    let currentSurveys = [...surveysState];
    let currentOfficers = [...officersState];
    let currentProvinces = [...provincesState];

    queueToSync.forEach((queuedSurvey, index) => {
      const freshId = `srv-sync-${Date.now()}-${index}`;
      const todayStr = new Date().toISOString().split('T')[0];

      const newSurvey: Survey = {
        ...queuedSurvey,
        id: freshId,
        date: todayStr
      };

      // 1. Prepend to active surveys list
      currentSurveys = [newSurvey, ...currentSurveys];

      // 2. Adjust or increment associated Field Officer quota
      const matchExists = currentOfficers.some(o => o.name.toLowerCase() === newSurvey.officerName.toLowerCase());
      if (matchExists) {
        currentOfficers = currentOfficers.map(o => {
          if (o.name.toLowerCase() === newSurvey.officerName.toLowerCase()) {
            return {
              ...o,
              surveyCount: o.surveyCount + 1,
              status: 'Active' as const
            };
          }
          return o;
        });
      } else {
        const initials = newSurvey.officerName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 3)
          .toUpperCase() || 'FO';

        const newOfficer: FieldOfficer = {
          id: `o-sync-${Date.now()}-${index}`,
          name: newSurvey.officerName,
          initials,
          province: newSurvey.province,
          surveyType: newSurvey.surveyType,
          surveyCount: 1,
          status: 'Active'
        };
        currentOfficers = [...currentOfficers, newOfficer];
      }

      // 3. Increment the province's active counts and blend average water access percent
      currentProvinces = currentProvinces.map(p => {
        if (p.name.toLowerCase() === newSurvey.province.toLowerCase()) {
          const newTotalCount = p.surveysCount + 1;
          const blendedWaterAccess = Math.round(
            ((p.waterAccess * p.surveysCount) + newSurvey.waterAccess) / newTotalCount
          );

          return {
            ...p,
            surveysCount: newTotalCount,
            waterAccess: blendedWaterAccess
          };
        }
        return p;
      });
    });

    // Update global state tree
    setSurveysState(currentSurveys);
    setOfficersState(currentOfficers);
    setProvincesState(currentProvinces);

    // Show beautiful synchronisation visual banner toast
    setSyncStatusBanner({ show: true, count: queueToSync.length });

    // Clear local storage queue
    setPendingSyncQueue([]);
    localStorage.removeItem('giz_pending_surveys');

    // Auto-dismiss synchronisation banner success
    setTimeout(() => {
      setSyncStatusBanner(null);
    }, 4500);
  };

  // Connectivity shift listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync if simulated offline is FALSE
      if (!simulatedOffline) {
        try {
          const stored = localStorage.getItem('giz_pending_surveys');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              handleTriggerSync(parsed);
            }
          }
        } catch (e) {
          console.error("Auto sync restoration failed:", e);
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [simulatedOffline, surveysState, officersState, provincesState]);

  // Handle simulated offline switch toggles
  const handleToggleSimulatedOffline = () => {
    const nextState = !simulatedOffline;
    setSimulatedOffline(nextState);

    // Sync automatically if going online, browser is connected, and surveys are queued
    if (!nextState && isOnline && pendingSyncQueue.length > 0) {
      handleTriggerSync(pendingSyncQueue);
    }
  };

  // Sync state data
  const handleAddSurvey = (newSurveyRaw: Omit<Survey, 'id' | 'date'>) => {
    if (!effectiveOnline) {
      // System is offline -> Queue reports safely locally in localStorage
      const updatedQueue = [...pendingSyncQueue, newSurveyRaw];
      setPendingSyncQueue(updatedQueue);
      localStorage.setItem('giz_pending_surveys', JSON.stringify(updatedQueue));
      return; // Return and let FieldSurveyTab handle offline confirmation layouts
    }

    const freshId = `srv-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newSurvey: Survey = {
      ...newSurveyRaw,
      id: freshId,
      date: todayStr
    };

    // 1. Add survey to history list
    setSurveysState(prev => [newSurvey, ...prev]);

    // 2. Adjust or increment associated Field Officer quota
    setOfficersState(prevOfficers => {
      const matchExists = prevOfficers.some(o => o.name.toLowerCase() === newSurvey.officerName.toLowerCase());
      
      if (matchExists) {
        return prevOfficers.map(o => {
          if (o.name.toLowerCase() === newSurvey.officerName.toLowerCase()) {
            return {
              ...o,
              surveyCount: o.surveyCount + 1,
              status: 'Active' as const
            };
          }
          return o;
        });
      } else {
        // Create new dynamic officer
        const initials = newSurvey.officerName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 3)
          .toUpperCase() || 'FO';

        const newOfficer: FieldOfficer = {
          id: `o-${Date.now()}`,
          name: newSurvey.officerName,
          initials,
          province: newSurvey.province,
          surveyType: newSurvey.surveyType,
          surveyCount: 1,
          status: 'Active'
        };
        return [...prevOfficers, newOfficer];
      }
    });

    // 3. Increment the province's active counts and blend average water access percent
    setProvincesState(prevProvinces => {
      return prevProvinces.map(p => {
        if (p.name.toLowerCase() === newSurvey.province.toLowerCase()) {
          // Weight calculation: average of existing and the new entry
          const newTotalCount = p.surveysCount + 1;
          const blendedWaterAccess = Math.round(
            ((p.waterAccess * p.surveysCount) + newSurvey.waterAccess) / newTotalCount
          );

          return {
            ...p,
            surveysCount: newTotalCount,
            waterAccess: blendedWaterAccess
          };
        }
        return p;
      });
    });

    // Redirect to Dashboard automatically so they can immediately see the new data rendered!
    setActiveTab('dashboard');
  };

  const tabsConfig = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'giza' as const, label: 'Sammy AI Assistant', icon: Bot },
    { id: 'survey' as const, label: 'Field Survey Form', icon: ClipboardList },
    { id: 'map' as const, label: 'Ward Map Grid', icon: Map },
    { id: 'officers' as const, label: 'CO-Officers', icon: Users },
    { id: 'reports' as const, label: 'Reports Hub', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-705" id="main-application-frame">
      
      {/* Top Main Corporate White Branding Bar */}
      <header className="bg-white text-slate-800 py-3 px-6 md:px-12 flex items-center justify-between shadow-xs shrink-0 border-b border-slate-150" id="header-bar">
        {/* Left Side Branding */}
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1" id="giz-brand-logo">
            <span className="font-serif font-black tracking-tighter text-[#E2001A] text-4xl select-none">giz</span>
            <div className="h-4 w-[2px] bg-slate-200 self-center mx-1"></div>
          </div>
          <div>
            <h1 className="text-base font-display font-medium text-slate-800 flex items-center gap-1.5" id="header-brand-title">
              <span className="font-bold tracking-tight">Community Pulse</span>
              <span className="text-[9px] bg-giz-primary text-white font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-sm">ZAMBIA</span>
            </h1>
            <p className="text-[10px] text-slate-450 font-sans tracking-wide">
              Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)
            </p>
          </div>
        </div>

        {/* Dynamic Connected Status Switcher + Sync Impending Badges Group */}
        <div className="flex items-center gap-4 shrink-0" id="header-interactions-group">
          {/* Recruiter Network Emulation Switch button */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs shadow-xxs" id="network-simulation-hub">
            <span className="text-[10px] font-bold text-slate-500 font-mono select-none uppercase">Simulate Offline:</span>
            <button
              onClick={handleToggleSimulatedOffline}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none 
                ${simulatedOffline ? 'bg-amber-500' : 'bg-slate-200'}`}
              id="simulate-offline-switch"
              title={simulatedOffline ? "Restore active internet linkage" : "Trigger mock network disconnect"}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out
                  ${simulatedOffline ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
            <span className={`text-[10px] font-bold font-mono tracking-wider ${effectiveOnline ? 'text-emerald-600' : 'text-amber-500'}`}>
              {effectiveOnline ? '● ONLINE' : '● OFFLINE'}
            </span>
          </div>

          {/* Sync Pending Badge Indicator */}
          {pendingSyncQueue.length > 0 && (
            <div 
              onClick={() => {
                if (effectiveOnline) {
                  handleTriggerSync(pendingSyncQueue);
                } else {
                  alert("Sync is held! You are operating inside simulated offline environment. Toggle Simulated Offline 'OFF' to auto-sync queued files.");
                }
              }}
              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-xxs select-none transition-all hover:scale-105 active:scale-95 cursor-pointer
                ${effectiveOnline 
                  ? 'bg-emerald-650 bg-emerald-600 text-white animate-pulse hover:bg-emerald-700' 
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
                }`}
              id="sync-pending-header-badge"
              title={effectiveOnline ? "Click to flush queue now!" : "Surveys cached offline. Return network online to sync."}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${effectiveOnline ? 'bg-white animate-ping' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>Sync Pending ({pendingSyncQueue.length})</span>
            </div>
          )}

          {/* Right Side Partner Badge - Official GIZ Institutional Branding */}
          <div className="hidden md:flex flex-col text-right space-y-0.5" id="partner-badge">
            <span className="text-xxs font-mono text-slate-400 font-bold tracking-wider uppercase">
              REPUBLIC OF ZAMBIA
            </span>
            <span className="text-[10px] text-giz-primary font-sans font-bold">
              Ministry of Water Development & Sanitation
            </span>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          id="mobile-menu-toggle"
          title="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Floating Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end" id="mobile-sidebar-backdrop">
          <div className="bg-white w-3/4 max-w-xs h-full p-6 space-y-6 flex flex-col shadow-2xl relative animate-slide-in" id="mobile-sidebar-card">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <span className="font-display font-medium text-slate-800 text-sm">Navigation</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-2 flex-grow" id="mobile-navigation-links">
              {tabsConfig.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-tab-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left cursor-pointer
                      ${active 
                        ? 'bg-giz-light text-giz-primary border-l-4 border-giz-primary' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-slate-100 pt-4 text-xxs font-mono text-slate-400 text-center uppercase tracking-wide">
              Tramo Core Link V1.4
            </div>
          </div>
        </div>
      )}

      {/* Secondary Desktop Horizontal App Tabs Navigation Bar */}
      <nav className="hidden md:flex bg-white border-b border-slate-100 px-12 py-1 items-center justify-between shrink-0 shadow-xxs" id="desktop-routing-tabs">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none" id="tabs-deck">
          {tabsConfig.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-xs font-semibold tracking-wide border-b-2 hover:bg-slate-50/50 transition-all cursor-pointer select-none
                  ${active 
                    ? 'border-giz-primary text-giz-primary' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-giz-primary animate-pulse' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="text-xxs font-mono text-slate-400 font-medium">
          STREAMS SYNCED: 22 FIELD OFFICERS LIVE
        </div>
      </nav>

      {/* Dynamic Sync Status Event Notification Banner Toast */}
      {syncStatusBanner && syncStatusBanner.show && (
        <div 
          className="fixed top-24 right-6 z-50 bg-slate-900 text-white border-l-4 border-emerald-500 py-3.5 px-5 rounded-r-xl shadow-xl flex items-center gap-4 max-w-sm animate-fade-in"
          id="sync-success-notification"
        >
          <div className="bg-emerald-500 p-1.5 rounded-lg shrink-0">
            <svg className="h-4 w-4 text-slate-900" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Telemetry Synchronized</h4>
            <p className="text-xs text-slate-300 font-sans mt-0.5 leading-tight">
              Flushed {syncStatusBanner.count} offline survey(s) safely into our active data pool.
            </p>
          </div>
        </div>
      )}

      {/* Primary Dynamic Tabs View Container */}
      <main className="flex-grow overflow-y-auto px-6 md:px-12 py-8 max-w-7xl w-full mx-auto" id="main-content-wrapper">
        
        {/* Dashboard View rendering */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            provinces={provincesState} 
            surveys={surveysState} 
          />
        )}

        {/* Sammy AI Assistant View rendering */}
        {activeTab === 'giza' && (
          <SammyAssistantTab />
        )}

        {/* Field Survey form compilation */}
        {activeTab === 'survey' && (
          <FieldSurveyTab 
            onAddSurvey={handleAddSurvey}
            availableOfficers={officersState.map(o => o.name)}
            isOnline={effectiveOnline}
            pendingSyncCount={pendingSyncQueue.length}
          />
        )}

        {/* Provinces grid & target values */}
        {activeTab === 'map' && (
          <WardMapTab 
            provinces={provincesState} 
          />
        )}

        {/* Officer lists */}
        {activeTab === 'officers' && (
          <OfficersTab 
            officers={officersState} 
          />
        )}

        {/* Report logs & export modules */}
        {activeTab === 'reports' && (
          <ReportsTab 
            initialReports={REPORTS_INITIAL} 
          />
        )}

      </main>

      {/* Global GIZ Yellow-Ochre Branding Footer */}
      <footer className="bg-giz-yellow border-t border-slate-200/50 py-6 px-6 md:px-12 shrink-0 text-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 relative" id="footer-frame">
        <div>
          <p className="text-xxs font-sans font-bold tracking-wider text-slate-950 uppercase selection:bg-giz-primary selection:text-white">
            DEUTSCHE GESELLSCHAFT FÜR INTERNATIONALE ZUSAMMENARBEIT (GIZ) GMBH
          </p>
          <p className="text-[10px] font-sans text-slate-700 mt-1 max-w-2xl leading-relaxed">
            Together with our partners, we create opportunities and sustainably improve people's lives. Through our networks, we turn international agendas into action – with a global vision and local Zambian impact.
          </p>
        </div>
        <div className="flex flex-col md:items-end gap-1 text-xxs font-mono text-slate-800 shrink-0">
          <div className="flex items-center gap-1.5 justify-center md:justify-end">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900 animate-ping"></span>
            <span className="font-bold uppercase">System Pipeline Active</span>
          </div>
          <span>CLIENT INTERFACE PORT: 3000</span>
        </div>

        {/* Floating circular red up-arrow matching the GIZ.de scroll-up button in user's screenshot */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute right-6 -top-5 hidden md:flex h-10 w-10 rounded-full bg-giz-primary hover:bg-giz-primary/90 text-white items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
          title="Scroll back to top"
        >
          <svg className="h-4 w-4 transform -rotate-90" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </footer>

    </div>
  );
}
