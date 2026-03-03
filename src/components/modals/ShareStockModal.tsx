import { useState, type FC } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { Stock, Medicine } from '@/types';
import Modal from '@/components/Modal';

interface Props { isOpen: boolean; onClose: () => void; stock: Stock; }

function formatStockAsText(stock: Stock): string {
  const lines: string[] = [];
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  lines.push(`📋 ${stock.name} — Medicine List`, `Generated: ${dateStr}`, '');
  const morning = stock.medicines?.filter(m => m.takeMorning) || [];
  const noon = stock.medicines?.filter(m => m.takeAfternoon) || [];
  const evening = stock.medicines?.filter(m => m.takeEvening) || [];
  if (morning.length) { lines.push(`Morning:`); morning.forEach(m => lines.push(`  • [${(m.morningTime ?? 9).toString().padStart(2,'0')}:00] ${m.name} ${m.dose}mg — ${m.quantity} left`)); lines.push(''); }
  if (noon.length) { lines.push(`Noon:`); noon.forEach(m => lines.push(`  • [${(m.afternoonTime ?? 14).toString().padStart(2,'0')}:00] ${m.name} ${m.dose}mg — ${m.quantity} left`)); lines.push(''); }
  if (evening.length) { lines.push(`Evening:`); evening.forEach(m => lines.push(`  • [${(m.eveningTime ?? 21).toString().padStart(2,'0')}:00] ${m.name} ${m.dose}mg — ${m.quantity} left`)); lines.push(''); }
  return lines.join('\n');
}

function generatePrintHTML(stock: Stock): string {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const morning = stock.medicines?.filter(m => m.takeMorning) || [];
  const noon = stock.medicines?.filter(m => m.takeAfternoon) || [];
  const evening = stock.medicines?.filter(m => m.takeEvening) || [];
  const sec = (t: string, meds: Medicine[], color: string, timeKey: 'morningTime'|'afternoonTime'|'eveningTime', defaultTime: number) => {
    if (!meds.length) return '';
    return `<div style="margin-bottom:20px;"><h3 style="color:${color};font-size:16px;margin-bottom:8px;border-bottom:2px solid ${color};padding-bottom:4px;">${t}</h3><ul style="list-style:none;padding:0;margin:0;">${meds.map(m => {
      const timeVal = m[timeKey] ?? defaultTime;
      const timeStr = timeVal.toString().padStart(2,'0') + ':00';
      return `<li style="padding:6px 0;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;"><span><span style="display:inline-block;width:55px;color:${color};font-weight:600;font-size:14px;">${timeStr}</span> <strong>${m.name}</strong> <span style="color:#94a3b8;">${m.dose}mg</span></span><span style="color:${Number(m.quantity)<=5?'#ef4444':'#64748b'};font-weight:600;">${m.quantity} left</span></li>`;
    }).join('')}</ul></div>`;
  };
  return `<!DOCTYPE html><html><head><title>${stock.name}</title><style>body{font-family:-apple-system,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#1e293b;}@media print{body{margin:20px;}}</style></head><body><h1 style="font-size:24px;margin-bottom:4px;">${stock.name}</h1><p style="color:#94a3b8;font-size:14px;margin-top:0;">Medicine List · Generated ${dateStr}</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;">${sec('Morning',morning,'#ea580c','morningTime',9)}${sec('Noon',noon,'#2563eb','afternoonTime',14)}${sec('Evening',evening,'#4f46e5','eveningTime',21)}</body></html>`;
}

const ShareStockModal: FC<Props> = ({ isOpen, onClose, stock }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatStockAsText(stock);
    try { await navigator.clipboard.writeText(text); } catch { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handlePDF = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(generatePrintHTML(stock)); w.document.close(); w.focus(); setTimeout(() => w.print(), 300); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Stock">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p className="modal-text-muted">Share <strong style={{ color: 'var(--text-primary)' }}>{stock.name}</strong> with {stock.medicines?.length || 0} medicines.</p>
        
        <button onClick={handleCopy} className={`share-btn ${copied ? 'copied' : ''}`}>
          <div className="share-icon-box">
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </div>
          <div className="share-text-box">
            <span className="share-title">{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            <span className="share-subtitle">Formatted text list ready to paste</span>
          </div>
        </button>
        
        <button onClick={handlePDF} className="share-btn">
          <div className="share-icon-box">
            <Download size={20} />
          </div>
          <div className="share-text-box">
            <span className="share-title">Download as PDF</span>
            <span className="share-subtitle">Opens print dialog to save as PDF</span>
          </div>
        </button>
      </div>
    </Modal>
  );
};

export default ShareStockModal;
