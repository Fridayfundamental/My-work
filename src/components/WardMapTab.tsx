import { MapPin, Info, ArrowUpRight, Signal } from 'lucide-react';
import { ProvinceData } from '../types';

interface WardMapTabProps {
  provinces: ProvinceData[];
}

export default function WardMapTab({ provinces }: WardMapTabProps) {
  
  const getIntensityColor = (pct: number) => {
    if (pct >= 65) return {
      card: 'border-l-4 border-l-emerald-600',
      text: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      bg: 'emerald',
      dot: 'bg-emerald-500'
    };
    if (pct >= 45) return {
      card: 'border-l-4 border-l-amber-500',
      text: 'text-amber-700 bg-amber-50 border-amber-100',
      bg: 'amber',
      dot: 'bg-amber-500'
    };
    return {
      card: 'border-l-4 border-l-red-500',
      text: 'text-red-700 bg-red-50 border-red-100',
      bg: 'red',
      dot: 'bg-red-500'
    };
  };

  const nationalAverage = Math.round(
    provinces.reduce((sum, p) => sum + p.waterAccess, 0) / provinces.length
  );

  return (
    <div className="space-y-6 animate-fade-in" id="ward-map-tab-container">
      
      {/* Mapbox Warning / info banner */}
      <div 
        id="mapbox-alert-banner" 
        className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3.5"
      >
        <Info className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-700">Map Interface Placeholder</p>
          <p className="text-xxs text-slate-500 font-sans leading-relaxed">
            Note: Full interactive geographic GIS satellite maps are available in the deployed production environment via Mapbox integration.
            Below is the local cellular provincial monitoring grid reflecting live field uploads.
          </p>
        </div>
      </div>

      {/* Top Title Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-xl">
        <div className="space-y-1">
          <h2 className="text-md font-display font-medium text-slate-800">Provincial Critical Watch List</h2>
          <p className="text-xs text-slate-500 font-sans">9 registered administrative regions in Zambia</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            STABLE (&ge;65%)
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            WARNING (45-64%)
          </div>
          <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            CRITICAL (&lt;45%)
          </div>
        </div>
      </div>

      {/* Grid containing 3x3 Province cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" id="provincial-3x3-grid">
        {provinces.map((prov) => {
          const config = getIntensityColor(prov.waterAccess);
          return (
            <div
              key={prov.name}
              id={`prov-card-${prov.name.toLowerCase()}`}
              className={`bg-white rounded-xl p-5 border border-slate-100 hover:shadow-xs hover:border-slate-200 transition-all ${config.card} flex flex-col justify-between h-[180px] relative overflow-hidden`}
            >
              {/* Backglow map indicator */}
              <div className="absolute top-2 right-2 h-14 w-14 rounded-full bg-slate-50 opacity-10 flex items-center justify-center text-slate-900 text-xxs font-mono font-bold select-none pointer-events-none">
                ZAM
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="text-xs font-mono tracking-wider font-semibold uppercase">{prov.name}</span>
                </div>
                
                <h3 className="text-4xl font-display font-semibold text-slate-800">
                  {prov.waterAccess}%
                </h3>
                <p className="text-xxs text-slate-400 font-sans">
                  Target threshold water accessibility mapping
                </p>
              </div>

              {/* Bottom stats and pill */}
              <div className="border-t border-slate-50 pt-3 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100/50">
                  {prov.surveysCount.toLocaleString()} surveys completed
                </span>
                
                <span className={`px-2.5 py-0.5 rounded-full font-semibold border text-xxs uppercase tracking-wider ${config.text}`}>
                  {prov.waterAccess >= 65 ? 'STABLE' : prov.waterAccess >= 45 ? 'ALERT' : 'CRITICAL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary insights deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="map-insights-row">
        
        {/* Geographic watch list */}
        <div id="urgent-priority-watch" className="bg-white border border-slate-100 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Signal className="h-4 w-4 text-red-500" />
            Urgent Priority Action Zones
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            The following regions feature water coverage ratios falling seriously below the 65% national target line requiring immediately dispatched water well drilling interventions:
          </p>

          <div className="space-y-3">
            {[
              { prov: 'Northern', val: '37%', status: 'Primary Critical Deficit' },
              { prov: 'Muchinga', val: '39%', status: 'Primary Critical Deficit' },
              { prov: 'Western', val: '41%', status: 'Socio-ecological Risk' },
              { prov: 'Northwestern', val: '44%', status: 'Secondary Deficit Warning' }
            ].map((e) => (
              <div key={e.prov} className="flex items-center justify-between text-xs bg-red-50/40 p-2 rounded-lg border border-red-100/30">
                <span className="font-semibold text-slate-700">{e.prov} Province</span>
                <div className="flex items-center gap-3">
                  <span className="text-red-700 font-mono font-bold bg-white px-2 py-0.5 rounded border border-red-100">{e.val}</span>
                  <span className="text-xxs text-slate-400 font-mono italic">{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* National Average Index */}
        <div id="national-average-gauge-card" className="bg-white border border-slate-100 rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800">
              National Average Gauge Analysis
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Zambia is working towards a combined 75% rural water integration roadmap by 2030. The current country average measures as follows:
            </p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center space-y-2">
            <span className="text-5xl font-display font-semibold text-giz-primary">{nationalAverage}%</span>
            <span className="text-xxs font-mono text-slate-400">AVERAGE ACCESSIBILITY DEVIATION</span>
            
            {/* Visual target track */}
            <div className="w-full max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden mt-2 relative">
              <div className="h-full bg-giz-primary rounded-full" style={{ width: `${nationalAverage}%` }} />
              {/* Target vertical marker at 75% */}
              <div className="absolute top-0 bottom-0 w-1 bg-giz-secondary left-[75%]" title="2030 Nation target (75%)" />
            </div>
            <div className="flex justify-between w-full max-w-xs text-[10px] text-slate-400 font-mono">
              <span>0%</span>
              <span className="text-giz-secondary font-bold">TARGET: 75%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="text-[11px] bg-sky-50 text-sky-800 p-2.5 rounded-lg border border-sky-100/40 font-sans text-center">
            Currently <strong>11% below</strong> the sustainable national target of 75%.
          </div>
        </div>

      </div>

    </div>
  );
}
