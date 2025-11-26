import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMongoStorage } from '@/hooks/useMongoStorage';
import { Member, WeekData, DAYS, DAY_NAMES, RQ_DAYS, RQ_DAY_NAMES } from '@/types/dashboard';
import { formatDateRange, addWeeks } from '@/lib/dateUtils';
import { Button } from '@/components/ui/button';

interface MemberStatsModalProps {
  memberId: string;
  onClose: () => void;
}

export function MemberStatsModal({ memberId, onClose }: MemberStatsModalProps) {
  const members = useMongoStorage<Member>('members');
  const weekData = useMongoStorage<WeekData>('weeks');
  
  const member = members.data.find(m => m.id === memberId);
  const memberWeeks = weekData.data
    .filter(w => w.id.startsWith(memberId))
    .sort((a, b) => new Date(b.week_start).getTime() - new Date(a.week_start).getTime());

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const currentWeek = memberWeeks[currentWeekIndex];

  if (!member) return null;

  const totalHired = memberWeeks.reduce((sum, w) => 
    sum + DAYS.reduce((daySum, day) => daySum + (w[day] || 0), 0), 0
  );

  const totalRQ = memberWeeks.reduce((sum, w) => 
    sum + RQ_DAYS.reduce((daySum, day) => daySum + (Number(w[day]) || 0), 0), 0
  );

  const weekSum = currentWeek 
    ? DAYS.reduce((sum, day) => sum + (currentWeek[day] || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card-surface p-6 max-w-4xl w-full my-8 animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Statystyki: {member.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-surface p-4 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Rola</div>
            <div className="text-lg font-semibold">{member.role}</div>
          </div>
          <div className="card-surface p-4 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Łącznie Zatrudnionych</div>
            <div className="text-2xl font-bold text-primary">{totalHired}</div>
          </div>
          <div className="card-surface p-4 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Łącznie RQ Wziętych</div>
            <div className="text-2xl font-bold text-primary">{totalRQ}</div>
          </div>
          <div className="card-surface p-4 border border-primary/20">
            <div className="text-sm text-muted-foreground mb-1">Liczba Tygodni</div>
            <div className="text-2xl font-bold text-primary">{memberWeeks.length}</div>
          </div>
        </div>

        {memberWeeks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Brak danych dla tego członka zespołu
          </div>
        ) : (
          <>
            {/* Week Navigation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentWeekIndex(currentWeekIndex + 1)}
                disabled={currentWeekIndex >= memberWeeks.length - 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Poprzedni
              </Button>
              
              <div className="text-lg font-semibold">
                {currentWeek && formatDateRange(new Date(currentWeek.week_start))}
              </div>

              <Button
                onClick={() => setCurrentWeekIndex(currentWeekIndex - 1)}
                disabled={currentWeekIndex <= 0}
                variant="outline"
                size="sm"
              >
                Następny
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {currentWeek && (
              <>
                {/* Sales Table */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Sprzedaż</h3>
                  <div className="card-surface overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-center">Cel</th>
                          {DAY_NAMES.map(day => (
                            <th key={day} className="px-4 py-3 text-center">{day}</th>
                          ))}
                          <th className="px-4 py-3 text-center">Suma</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-4 py-3 text-center">{currentWeek.goal}</td>
                          {DAYS.map(day => (
                            <td key={day} className="px-4 py-3 text-center">{currentWeek[day]}</td>
                          ))}
                          <td className="px-4 py-3 text-center font-semibold text-primary">{weekSum}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* RQ Table */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">RQ</h3>
                  <div className="card-surface overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {RQ_DAY_NAMES.map(day => (
                            <th key={day} className="px-4 py-3 text-center">{day}</th>
                          ))}
                          <th className="px-4 py-3 text-left">Uwagi</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          {RQ_DAYS.map(day => (
                            <td key={day} className="px-4 py-3 text-center">{currentWeek[day] || '-'}</td>
                          ))}
                          <td className="px-4 py-3">{currentWeek.rq_notes || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Zamknij</Button>
        </div>
      </div>
    </div>
  );
}
