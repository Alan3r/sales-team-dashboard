import { useMongoStorage } from '@/hooks/useMongoStorage';
import { Member, WeekData, DAYS } from '@/types/dashboard';
import { LineChart } from './LineChart';

export function ResultsHistory() {
  const members = useMongoStorage<Member>('members');
  const weekData = useMongoStorage<WeekData>('weeks');

  // Get last 12 weeks
  const last12Weeks = [...new Set(weekData.data.map(w => w.week_start))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 12)
    .reverse();

  // Chart 1: Total hires per week
  const totalWeeklySeries = [{
    name: 'Zatrudnienia',
    color: '#d4a574',
    data: last12Weeks.map(weekStart => {
      const weekTotal = weekData.data
        .filter(w => w.week_start === weekStart)
        .reduce((sum, w) => sum + DAYS.reduce((daySum, day) => daySum + (w[day] || 0), 0), 0);
      
      const date = new Date(weekStart);
      return {
        x: `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: weekTotal,
      };
    }),
  }];

  // Chart 2: Top 5 members by total hires
  const memberTotals = members.data.map(member => {
    const total = weekData.data
      .filter(w => w.id.startsWith(member.id))
      .reduce((sum, w) => sum + DAYS.reduce((daySum, day) => daySum + (w[day] || 0), 0), 0);
    return { ...member, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  const last8Weeks = [...new Set(weekData.data.map(w => w.week_start))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 8)
    .reverse();

  const colors = ['#9c27b0', '#e91e63', '#d4a574', '#03a9f4', '#4caf50'];

  const memberSeries = memberTotals.map((member, index) => ({
    name: member.name,
    color: colors[index],
    data: last8Weeks.map(weekStart => {
      const weekD = weekData.data.find(w => w.week_start === weekStart && w.id.startsWith(member.id));
      const total = weekD ? DAYS.reduce((sum, day) => sum + (weekD[day] || 0), 0) : 0;
      const date = new Date(weekStart);
      return {
        x: `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: total,
      };
    }),
  }));

  return (
    <div className="space-y-8">
      {weekData.data.length === 0 ? (
        <div className="card-surface p-12 text-center text-muted-foreground">
          <p className="text-lg">Brak danych historycznych</p>
          <p className="mt-2">Rozpocznij dodawanie członków zespołu i tygodni pracy, aby zobaczyć statystyki</p>
        </div>
      ) : (
        <>
          <LineChart
            series={totalWeeklySeries}
            title="Porównanie Tygodni"
          />

          {memberSeries.length > 0 && (
            <LineChart
              series={memberSeries}
              title="Trend Wydajności Członków (Top 5)"
            />
          )}
        </>
      )}
    </div>
  );
}
