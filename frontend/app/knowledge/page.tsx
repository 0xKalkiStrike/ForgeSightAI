'use client';

import { useState } from 'react';
import { BookOpen, Search, FileText, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { queryKnowledge, KnowledgeResponse } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

const QUICK_PROMPTS = [
  "How do I inspect the bearing on M-104?",
  "What is the hydraulic pressure spec for H-201?",
  "What coolant concentration percentage should be maintained?",
  "How to perform laser shaft alignment on pump P-302?"
];

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<KnowledgeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    toast.info(`Querying RAG vector database for '${queryText.substring(0, 35)}...'`, 'Searching SOPs');
    try {
      const res = await queryKnowledge(queryText);
      setResult(res);
      toast.success('RAG technical answer generated from indexed plant manuals.', 'Knowledge Retrieved');
    } catch (err) {
      toast.error('Search failed. Verify backend service.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Industrial Technical Knowledge Assistant</h1>
          <p className="text-xs text-slate-500">RAG Vector Search over Equipment Manuals, SOPs, and Maintenance Logs</p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="industrial-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Ask a technical question (e.g., How do I inspect the drive bearing on M-104?)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>
          <button
            onClick={() => handleSearch(query)}
            disabled={loading}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap shadow-xs"
          >
            {loading ? 'Searching...' : 'Search RAG'}
          </button>
        </div>

        {/* Quick Sample Questions */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 block">Suggested Quick Questions:</span>
          <div className="flex flex-wrap items-center gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(prompt);
                  handleSearch(prompt);
                }}
                className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Answer Card (2 Cols) */}
          <div className="lg:col-span-2 industrial-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">RAG Synthesized Technical Guidance</h2>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified Guidance
              </span>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 font-medium">
              {result.answer}
            </div>
          </div>

          {/* Sources List (1 Col) */}
          <div className="industrial-card p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-slate-600" />
              <h2 className="text-base font-bold text-slate-900">Referenced Documents</h2>
            </div>

            <div className="space-y-3 text-xs">
              {result.sources?.map((src: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block">{src.title}</span>
                  <span className="text-[11px] text-amber-700 font-semibold block">{src.section || src.section_title || 'Section Reference'}</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">{src.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
