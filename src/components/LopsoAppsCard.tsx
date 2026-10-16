import React from 'react';
import { ExternalLink } from 'lucide-react';
import { LOPSO_APPS, LOPSO_LINKS } from '../data/lopsoApps';

// Lives behind the parent gate: children never see outbound links.
export const LopsoAppsCard: React.FC = () => (
  <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-sky-200 shadow-xs mb-6">
    <h3 className="text-lg font-black text-slate-800 mb-1">Ứng dụng khác từ lopso.vn</h3>
    <p className="text-sm font-semibold text-slate-500 mb-4">
      Bé Vui Học Cộng miễn phí. Nếu bố mẹ hay thầy cô thấy hữu ích, mời xem thêm:
    </p>

    <div className="grid sm:grid-cols-2 gap-3">
      {LOPSO_APPS.map((app) => (
        <a
          key={app.id}
          href={app.url}
          target="_blank"
          rel="noopener"
          className="group flex flex-col p-4 rounded-2xl border-2 border-slate-200 bg-sky-50/50 hover:border-sky-400 hover:bg-sky-50 transition"
        >
          <span className="flex items-center gap-2 font-black text-slate-900">
            <span className="text-2xl" aria-hidden="true">{app.icon}</span>
            {app.name}
          </span>
          <span className="text-xs font-bold text-sky-700 mt-1">{app.audience}</span>
          <span className="text-sm font-semibold text-slate-600 mt-2 leading-relaxed flex-1">
            {app.description}
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-sky-700 group-hover:underline">
            {app.cta}
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
          </span>
        </a>
      ))}
    </div>

    <nav
      aria-label="Liên kết lopso.vn"
      className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs font-bold text-slate-500"
    >
      {LOPSO_LINKS.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target={link.url.startsWith('mailto:') ? undefined : '_blank'}
          rel="noopener"
          className="hover:text-sky-700 hover:underline"
        >
          {link.label}
        </a>
      ))}
    </nav>
  </div>
);
