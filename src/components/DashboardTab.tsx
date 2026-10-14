import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, ClipboardList, Droplets, MapPin } from 'lucide-react';
import { Survey, ProvinceData } from '../types';
import { NUTRITION_INITIAL } from '../data';

interface DashboardTabProps {
  provinces: ProvinceData[];
  surveys: Survey[];
}

export default function DashboardTab({ provinces, surveys }: DashboardTabProps) {
  // Compute some dynamic stats if any new survey was added
  const totalWaterAccessAverage = Math.round(
    provinces.reduce((sum, p) => sum + p.waterAccess, 0) / provinces.length
  );
  
  const totalSurveys = provinces.reduce((sum, p) => sum + p.surveysCount, 0) + surveys.length - 4; // adjusted to keep it starting around 3,741

  const metrics = [
    {
      id: 'metric-communities',
      title: 'Communities Reached',
      value: '1,284',
      desc: 'Active monitoring sectors',
      icon: MapPin,
      color: 'text-giz-primary bg-giz-light',
    },
    {
      id: 'metric-surveys',
      title: 'Surveys Completed',
      value: totalSurveys.toLocaleString(),
      desc: 'Valid records collected',
      icon: ClipboardList,
      color: 'text-giz-secondary bg-sky-50',
    },
    {
      id: 'metric-water',
      title: 'Water Access Avg',
      value: `${totalWaterAccessAverage}%`,
      desc: 'National average standard',
      icon: Droplets,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'metric-officers',
      title: 'Active Officers',
      value: '47',
      desc: 'On-the-ground agents',
      icon: Users,
      color: 'text-emerald-700 bg-emerald-50',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" id="dashboard-tab-container">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-slate-800" id="dashboard-welcome-heading">
            Field Intelligence Overview
          </h1>
          <p className="text-sm text-slate-500 font-sans" id="dashboard-welcome-subheading">
            Real-time telemetry and project updates across Zambia's provinces
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100" id="last-updated-tag">
          <span className="h-2 w-2 rounded-full bg-giz-primary animate-pulse"></span>
          STREAMS SYNCED: SECONDS AGO
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metrics-grid">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div
              key={metric.id}
              id={metric.id}
              className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-sm transition-all flex items-start justify-between"
            >
              <div className="space-y-3">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block font-sans">
                  {metric.title}
                </span>
                <span className="text-3xl font-display font-semibold text-slate-800 block">
                  {metric.value}
                </span>
                <span className="text-xs text-slate-500 font-sans block">
                  {metric.desc}
                </span>
              </div>
              <div className={`p-3.5 rounded-lg ${metric.color}`}>
                <IconComponent className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="dashboard-charts-grid">
        {/* Provincal Water Access Chart */}
        <div id="chart-water-access-card" className="bg-white border border-slate-100 p-6 rounded-xl flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-md font-display font-medium text-slate-800">
              Water Access Average by Province
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Critical water accessibility levels (Target target: &gt; 65%)
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={provinces}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-sans)' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'var(--font-sans)' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}% Access`, 'Water Access']} 
                  contentStyle={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '12px', 
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1'
                  }}
                />
                <Bar dataKey="waterAccess" radius={[4, 4, 0, 0]}>
                  {provinces.map((entry, index) => {
                    // Color based on water access % as requested
                    let barColor = '#1D9E75'; // Green
                    if (entry.waterAccess < 45) {
                      barColor = '#EF4444'; // Red
                    } else if (entry.waterAccess < 65) {
                      barColor = '#F59E0B'; // Amber
                    }
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nutrition Assessment Chart */}
        <div id="chart-nutrition-card" className="bg-white border border-slate-100 p-6 rounded-xl flex flex-col h-[400px]">
          <div className="mb-4">
            <h3 className="text-md font-display font-medium text-slate-800">
              Child Nutrition Assessments (Jan - Jun)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Total assessed children (March dip highlighted in Amber)
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={NUTRITION_INITIAL}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-sans)' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'var(--font-sans)' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} assessed`, 'Children Assessed']} 
                  contentStyle={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1'
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {NUTRITION_INITIAL.map((entry, index) => {
                    const barColor = entry.isDip ? '#F59E0B' : '#0F6E56'; // Amber if March dip, else GIZ primary
                    return <Cell key={`cell-nut-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Surveys Table */}
      <div id="active-surveys-table-card" className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-md font-display font-medium text-slate-800">
              Active Monitoring Operations
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Currently deployed field surveys and scheduled reviews
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 bg-giz-light text-giz-primary font-semibold rounded-full">
            {surveys.length} ACTIVE DEPLOYMENTS
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="active-surveys-table">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-xxs font-mono uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3 font-medium">Project Focus</th>
                <th className="px-6 py-3 font-medium">Province / Ward</th>
                <th className="px-6 py-3 font-medium">Field Officer</th>
                <th className="px-6 py-3 font-medium">Responses / Visits</th>
                <th className="px-6 py-3 font-medium">Coverage</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-sans" id="surveys-table-body">
              {surveys.map((survey) => {
                // Determine pill classes
                let statusClasses = '';
                if (survey.status === 'Active') {
                  statusClasses = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                } else if (survey.status === 'Pending') {
                  statusClasses = 'bg-amber-50 text-amber-700 border-amber-100';
                } else {
                  statusClasses = 'bg-blue-50 text-blue-700 border-blue-100';
                }

                return (
                  <tr key={survey.id} className="hover:bg-slate-50/20 transition-colors" id={`survey-row-${survey.id}`}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{survey.surveyType}</div>
                      <div className="text-xs text-slate-400 max-w-[280px] truncate">{survey.observations}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700">{survey.province} Province</div>
                      <div className="text-xs text-slate-400 font-mono">{survey.ward} Ward</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{survey.officerName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {survey.householdsVisited > 0 ? `${survey.householdsVisited} households` : '--'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-600">{survey.waterAccess}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="bg-giz-primary h-full rounded-full" 
                            style={{ width: `${survey.waterAccess}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClasses}`}>
                        {survey.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
