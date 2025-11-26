import { useState } from 'react';
import { CurrentWeek } from '@/components/dashboard/CurrentWeek';
import { TeamStructure } from '@/components/dashboard/TeamStructure';
import { RQStatistics } from '@/components/dashboard/RQStatistics';
import { ResultsHistory } from '@/components/dashboard/ResultsHistory';
import { Toast } from '@/components/Toast';

type Tab = 'current' | 'structure' | 'rq' | 'history';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('current');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
  };

  const tabs = [
    { id: 'current' as Tab, label: 'Bieżący Tydzień' },
    { id: 'structure' as Tab, label: 'Struktura Zespołu' },
    { id: 'rq' as Tab, label: 'Statystyki RQ' },
    { id: 'history' as Tab, label: 'Historia Wyników' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Executive Performance Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">System zarządzania zespołem sprzedażowym</p>
        </header>

        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-card hover:bg-card/80 text-foreground hover-lift'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="animate-in fade-in duration-300">
          {activeTab === 'current' && <CurrentWeek showToast={showToast} />}
          {activeTab === 'structure' && <TeamStructure />}
          {activeTab === 'rq' && <RQStatistics showToast={showToast} />}
          {activeTab === 'history' && <ResultsHistory />}
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
