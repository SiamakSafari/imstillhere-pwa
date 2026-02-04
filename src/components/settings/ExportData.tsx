'use client';

import React, { useState } from 'react';

interface ExportDataProps {
  profileId: string | undefined;
}

export const ExportData: React.FC<ExportDataProps> = ({ profileId }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // In the PWA we generate a CSV from whatever data is available
      const csvRows = ['Date,Method'];
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imstillhere-checkins-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Could not export check-in history.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = { exportedAt: new Date().toISOString(), profileId };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imstillhere-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Could not export your data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        Export Data
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--gray-400)', lineHeight: '1.5' }}>
        Download your check-in history for your records.
      </p>
      <div className="space-y-2">
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="w-full font-bold py-3 rounded-lg transition-all btn-press disabled:opacity-50"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--gray-800)', color: 'var(--accent)' }}
        >
          📥 Export CSV
        </button>
        <button
          onClick={handleExportJSON}
          disabled={isExporting}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all btn-press disabled:opacity-50"
          style={{ color: 'var(--gray-400)' }}
        >
          Export Full Backup
        </button>
      </div>
    </div>
  );
};
