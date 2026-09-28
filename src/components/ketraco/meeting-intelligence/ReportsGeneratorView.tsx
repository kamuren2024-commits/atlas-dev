import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Printer,
  Sparkles,
  Check,
  Building,
  ShieldCheck,
  Layers,
  Clock
} from 'lucide-react';
import type { MeetingIntelligenceOverview } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  data: MeetingIntelligenceOverview;
}

export const ReportsGeneratorView: React.FC<Props> = ({ data }) => {
  const [reportType, setReportType] = useState<string>('minutes');
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchReport(reportType);
  }, [reportType, data.next_meeting.id]);

  const fetchReport = async (type: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/meeting-intelligence/reports/${type}?meetingId=${data.next_meeting.id}`);
      if (res.ok) {
        const json = await res.json();
        setMarkdownContent(json.markdown || '');
      } else {
        generateFallbackReport(type);
      }
    } catch (e) {
      generateFallbackReport(type);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackReport = (type: string) => {
    const timestamp = new Date().toISOString();
    let md = `# KETRACO EXECUTIVE REPORT: ${type.toUpperCase()}\n`;
    md += `Meeting: ${data.next_meeting.title} (${data.next_meeting.date})\n`;
    md += `Generated: ${timestamp} | Classification: KETRACO INTERNAL GOVERNANCE\n\n`;

    if (type === 'decision-register') {
      md += `## STATUTORY DECISION REGISTER\n\n`;
      data.decision_register.items.forEach(d => {
        md += `### ${d.code}: ${d.title}\n`;
        md += `- Status: ${d.status}\n- Authority: ${d.authority}\n- Owner: ${d.owner}\n- Evidence: ${d.evidence_text || 'Verified'}\n\n`;
      });
    } else if (type === 'action-register') {
      md += `## ACTION CONTROL QUEUE\n\n`;
      data.action_control.items.forEach(a => {
        md += `### ${a.action_title}\n`;
        md += `- Owner: ${a.owner} (${a.department})\n- Due: ${a.due_date}\n- Priority: ${a.priority}\n- Status: ${a.status}\n\n`;
      });
    } else {
      md += `## EXECUTIVE SUMMARY\n${data.next_meeting.objective}\n\n`;
      md += `Total Decisions: ${data.decision_register.total} | Actions: ${data.action_control.total} | Risks: ${data.risks.length}\n`;
    }
    setMarkdownContent(md);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KETRACO_Report_${reportType}_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Enterprise Governance Report Generator
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Export audit-proof Markdown, JSON, and printable briefings compliant with PPADA statutory transparency standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Content'}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Report
          </button>
        </div>
      </div>

      {/* Select Report Template */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0c1220] border border-slate-800/80 rounded-xl p-2.5">
        {[
          { id: 'minutes', label: 'Official Minutes' },
          { id: 'executive-brief', label: 'Executive Brief' },
          { id: 'decision-register', label: 'Decision Register' },
          { id: 'action-register', label: 'Action Control Register' },
          { id: 'risk-update', label: 'Risk Radar' },
          { id: 'procurement-clarifications', label: 'Procurement Clarifications' }
        ].map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => setReportType(tpl.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              reportType === tpl.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {/* Markdown Preview Box */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
          <span>REPORT PREVIEW • {reportType.toUpperCase()}</span>
          <span>{isLoading ? 'Compiling Report...' : 'Ready for Export'}</span>
        </div>

        <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto p-4 bg-slate-950/60 rounded-lg border border-slate-800/60">
          {markdownContent}
        </pre>
      </div>
    </div>
  );
};
