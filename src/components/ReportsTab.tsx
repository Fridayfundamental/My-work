import React, { useState } from 'react';
import { FileText, Download, Play, RefreshCw, Layers, CheckCircle, FileUp } from 'lucide-react';
import { Report } from '../types';

interface ReportsTabProps {
  initialReports: Report[];
}

export default function ReportsTab({ initialReports }: ReportsTabProps) {
  const [reportsList, setReportsList] = useState<Report[]>(initialReports);
  const [selectedType, setSelectedType] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string>('');

  const handleDownload = (report: Report) => {
    // Shows alert in demo as specified, styled professionally
    alert(`[Demo Mode Download] Initiating secure download stream for file:\n"${report.title}" (${report.size})\nSource unit: GIZ Zambia ${report.author}.`);
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Please select a focused report type first.");
      return;
    }

    setGenerating(true);
    setSuccessBanner('');

    // 2 second loading timer as requested
    setTimeout(() => {
      const formattedDate = new Date().toISOString().split('T')[0];
      const codeSuffix = Math.floor(100 + Math.random() * 900);
      
      const newReport: Report = {
        id: `rep-gen-${Date.now()}`,
        title: `Comprehensive Zambia Field Analysis Report (${selectedType}) #${codeSuffix}`,
        type: selectedType,
        date: formattedDate,
        size: `${(Math.random() * 5 + 2).toFixed(1)} MB`,
        author: 'GIZ Sammy Auto-Compiler'
      };

      setReportsList(prev => [newReport, ...prev]);
      setGenerating(false);
      setSuccessBanner(`System compiled successfully: "${newReport.title}" was generated and appended directly to the Downloads inventory list below.`);
      setSelectedType('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="reports-tab-container">
      <div>
        <h1 className="text-2xl font-display font-medium text-slate-800" id="reports-title">
          Database Aggregator & Report Compiler
        </h1>
        <p className="text-sm text-slate-500 font-sans" id="reports-subtitle">
          Export high-fidelity analytical dossiers or trigger instant AI analytical compilation loops
        </p>
      </div>

      {/* Compiler Card */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xsm" id="report-generator-card">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-giz-primary" />
            <span className="text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
              ON-DEMAND RE-REPORT COMPILATION
            </span>
          </div>
          <span className="text-xs font-mono px-2.5 py-0.5 bg-giz-light text-giz-primary font-semibold rounded-full select-none">
            ENGINE STATUS: IDLE
          </span>
        </div>

        <form onSubmit={handleGenerateReport} className="p-6 space-y-4" id="generator-form">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2 space-y-1.5" id="form-field-generator-type">
              <label className="text-xs font-semibold text-slate-600 block">Report Target Domain</label>
              <select
                className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-giz-primary text-slate-700"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={generating}
                id="generator-report-type-select"
              >
                <option value="">-- Choose Field Sub-Domain --</option>
                <option value="Water & Sanitation">Water & Sanitation Focus (All Provinces)</option>
                <option value="Child Nutrition">Child Nutrition & Dry-Season Support Assess</option>
                <option value="CDF Governance">CDF Infrastructure Allocation Auditing</option>
                <option value="Renewable Energy">Renewable Off-Grid Mini-Grid Feasibility</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={generating || !selectedType}
              className="px-6 py-2.5 bg-giz-primary cursor-pointer hover:bg-giz-primary/95 text-white font-medium text-xs rounded-xl transition-all shadow-sm focus:outline-none flex items-center justify-center gap-1.5 disabled:opacity-55 disabled:cursor-not-allowed h-[42px] uppercase tracking-wider"
              id="generator-submit-btn"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Compiling Data...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" />
                  Generate Report
                </>
              )}
            </button>
          </div>

          {generating && (
            <div className="pt-2" id="generator-loading-indicator">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>SIMULATING SQL CROSS-JOIN TELEMETRY</span>
                <span>65% compiled</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-giz-primary h-full rounded-full transition-all duration-1000 w-2/3" />
              </div>
            </div>
          )}

          {successBanner && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5 shadow-sm" id="generator-success-card">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <p className="text-xs font-sans font-medium">{successBanner}</p>
            </div>
          )}
        </form>
      </div>

      {/* Pre-compiled Reports List */}
      <div className="space-y-4" id="reports-list-stack">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Available Dossiers ({reportsList.length})</h3>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">SORTED: RECENCY</span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white" id="reports-log">
          {reportsList.map((report) => (
            <div 
              key={report.id} 
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/40 transition-colors"
              id={`report-row-${report.id}`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-red-50 text-red-650 rounded-lg border border-red-100/50 shrink-0">
                  <FileText className="h-5 w-5 text-red-650" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-800 leading-normal">{report.title}</h4>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="px-2 py-0.5 bg-slate-15 bg-slate-100 text-slate-600 rounded font-mono font-medium text-[10px] uppercase">
                      {report.type}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Date: {report.date}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Size: {report.size}
                    </span>
                    <span className="text-slate-45 text-slate-400 font-sans text-[10px]">
                      By: {report.author}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDownload(report)}
                className="px-4 py-2 border border-slate-200 hover:border-giz-primary hover:text-giz-primary text-slate-600 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 hover:shadow-xsm self-end sm:self-center"
                id={`btn-download-${report.id}`}
              >
                <Download className="h-3.5 w-3.5" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
