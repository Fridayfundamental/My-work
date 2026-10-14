import { useState } from 'react';
import { Users, Search, ClipboardCheck, ArrowUpRight, TrendingUp, Award } from 'lucide-react';
import { FieldOfficer } from '../types';

interface OfficersTabProps {
  officers: FieldOfficer[];
}

export default function OfficersTab({ officers }: OfficersTabProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredOfficers = officers.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.surveyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusClasses = (status: 'Active' | 'Pending' | 'Upcoming') => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Upcoming':
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const totalTeamSurveys = officers.reduce((sum, o) => sum + o.surveyCount, 0);

  return (
    <div className="space-y-6 animate-fade-in" id="officers-tab-container">
      
      {/* Search and Team Stats panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-slate-100 rounded-xl">
        <div className="space-y-1">
          <h2 className="text-md font-display font-medium text-slate-800">Field Operations Directory</h2>
          <p className="text-xs text-slate-500 font-sans">
            Overseeing {officers.length} field specialist agents and coordinators
          </p>
        </div>

        {/* Search Input bar */}
        <div className="relative w-full md:w-80" id="officer-search-bar">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search officer, province or focus..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-giz-primary focus:outline-none text-slate-700 placeholder-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="officer-directory-search-input"
          />
        </div>
      </div>

      {/* Aggregate team indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="officers-summary-cards">
        
        {/* Metric 1 */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Integrated Reports</span>
            <span className="text-2xl font-display font-bold text-slate-800 block">
              {totalTeamSurveys.toLocaleString()}
            </span>
            <span className="text-xxs text-slate-400 block font-sans">Across 9 regions of Zambia</span>
          </div>
          <div className="p-3 bg-giz-light text-giz-primary rounded-lg">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Operational Synergy</span>
            <span className="text-2xl font-display font-bold text-slate-800 block">
              {Math.round((officers.filter(o => o.status === 'Active').length / officers.length) * 100)}%
            </span>
            <span className="text-xxs text-slate-400 block font-sans">Active in real-time streaming</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Top Performer</span>
            <span className="text-md font-display font-bold text-slate-800 block">
              {officers.reduce((prev, current) => (prev.surveyCount > current.surveyCount) ? prev : current).name}
            </span>
            <span className="text-xxs text-slate-400 block font-sans">Highest completed quota</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Officers Cards List Grid */}
      {filteredOfficers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="officers-cards-grid">
          {filteredOfficers.map((officer) => {
            const statusStyle = getStatusClasses(officer.status);

            return (
              <div
                key={officer.id}
                id={`officer-card-${officer.id}`}
                className="bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-200 transition-all flex flex-col justify-between h-[210px]"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Initials Circle Avatar */}
                    <div 
                      className="h-11 w-11 rounded-full bg-giz-light text-giz-primary font-display font-bold text-sm flex items-center justify-center border border-giz-primary/10 select-none uppercase"
                      id={`officer-avatar-${officer.id}`}
                    >
                      {officer.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 font-sans">{officer.name}</h3>
                      <span className="text-xxs text-slate-400 font-mono block uppercase tracking-wider">
                        {officer.province} province
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xxs font-semibold border ${statusStyle}`}>
                    {officer.status}
                  </span>
                </div>

                {/* Sub-body Details */}
                <div className="py-4 space-y-1.5 flex-1 flex flex-col justify-end">
                  <div className="text-slate-500 text-xxs font-serif italic font-medium uppercase font-sans">
                    Core Specialization Focus
                  </div>
                  <div className="text-slate-800 text-xs font-semibold font-display">
                    {officer.surveyType}
                  </div>
                </div>

                {/* Footer survey counter */}
                <div className="border-t border-slate-50 pt-3 flex items-center justify-between font-mono text-xxs text-slate-400">
                  <span>METADATA TRACKS</span>
                  <span className="text-slate-700 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    {officer.surveyCount > 0 ? `${officer.surveyCount} responses` : '--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-55 bg-white border border-slate-100 p-12 text-center rounded-xl" id="no-officers-found-card">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No field officers match your search.</p>
          <p className="text-xs text-slate-400 font-sans mt-1">Try querying using name initials, provinces, or survey focus keywords.</p>
        </div>
      )}

    </div>
  );
}
