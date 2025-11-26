import { useMongoStorage } from '@/hooks/useMongoStorage';
import { Member, WeekData, RQ_DAYS, RQ_DAY_NAMES } from '@/types/dashboard';
import { EditableCell } from './EditableCell';
import { LineChart } from './LineChart';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface RQStatisticsProps {
  showToast: (message: string) => void;
}

export function RQStatistics({ showToast }: RQStatisticsProps) {
  const members = useMongoStorage<Member>('members');
  const weekData = useMongoStorage<WeekData>('weeks');

  const latestWeeks = [...new Set(weekData.data.map(w => w.week_start))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 1);

  const currentWeekData = latestWeeks[0]
    ? weekData.data.filter(w => w.week_start === latestWeeks[0])
    : [];

  const totalRQ = weekData.data.reduce((sum, w) => 
    sum + RQ_DAYS.reduce((daySum, day) => daySum + (Number(w[day]) || 0), 0), 0
  );

  const currentWeekRQ = currentWeekData.reduce((sum, w) =>
    sum + RQ_DAYS.reduce((daySum, day) => daySum + (Number(w[day]) || 0), 0), 0
  );

  const uniqueWeeks = [...new Set(weekData.data.map(w => w.week_start))].length;

  const updateCell = async (id: string, field: string, value: number | string) => {
    weekData.updateItem(id, { [field]: value });
  };

  // Get top 5 members by total RQ
  const memberRQTotals = members.data.map(member => {
    const total = weekData.data
      .filter(w => w.id.startsWith(member.id))
      .reduce((sum, w) => sum + RQ_DAYS.reduce((daySum, day) => daySum + (Number(w[day]) || 0), 0), 0);
    return { ...member, total };
  }).sort((a, b) => b.total - a.total).slice(0, 5);

  // Prepare chart data
  const last8Weeks = [...new Set(weekData.data.map(w => w.week_start))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 8)
    .reverse();

  const colors = ['#9c27b0', '#e91e63', '#d4a574', '#03a9f4', '#4caf50'];

  const chartSeries = memberRQTotals.map((member, index) => ({
    name: member.name,
    color: colors[index],
    data: last8Weeks.map(weekStart => {
      const weekD = weekData.data.find(w => w.week_start === weekStart && w.id.startsWith(member.id));
      const total = weekD ? RQ_DAYS.reduce((sum, day) => sum + (Number(weekD[day]) || 0), 0) : 0;
      const date = new Date(weekStart);
      return {
        x: `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}`,
        y: total,
      };
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-surface p-6">
          <div className="text-sm text-muted-foreground mb-2">Łącznie RQ Wziętych</div>
          <div className="text-3xl font-bold text-primary">{totalRQ}</div>
        </div>
        <div className="card-surface p-6">
          <div className="text-sm text-muted-foreground mb-2">RQ w Bieżącym Tygodniu</div>
          <div className="text-3xl font-bold text-primary">{currentWeekRQ}</div>
        </div>
        <div className="card-surface p-6">
          <div className="text-sm text-muted-foreground mb-2">Liczba Członków Zespołu</div>
          <div className="text-3xl font-bold text-primary">{members.data.length}</div>
        </div>
        <div className="card-surface p-6">
          <div className="text-sm text-muted-foreground mb-2">Liczba Tygodni</div>
          <div className="text-3xl font-bold text-primary">{uniqueWeeks}</div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={() => showToast('Dane są automatycznie zapisywane po każdej edycji')}
        className="bg-primary hover:bg-primary/90"
      >
        <Save className="mr-2 h-4 w-4" />
        💾 ZAPISZ STATYSTYKI RQ
      </Button>

      {/* RQ Table */}
      <div className="card-surface overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">Imię</th>
              <th className="px-4 py-3 text-left font-semibold">Rola</th>
              {RQ_DAY_NAMES.map(day => (
                <th key={day} className="px-4 py-3 text-center font-semibold">{day}</th>
              ))}
              <th className="px-4 py-3 text-left font-semibold">Uwagi</th>
            </tr>
          </thead>
          <tbody>
            {currentWeekData.map(data => (
              <tr key={data.id} className="border-b border-border hover:bg-background-secondary/30 transition-colors">
                <td className="px-4 py-3">{data.name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium bg-role-${data.role.toLowerCase().replace(' ', '-')}/20`}>
                    {data.role}
                  </span>
                </td>
                {RQ_DAYS.map(day => (
                  <td key={day} className="px-4 py-3 text-center">
                    <EditableCell
                      value={data[day]}
                      onSave={(v) => updateCell(data.id, day, v)}
                      type="text"
                    />
                  </td>
                ))}
                <td className="px-4 py-3">
                  <EditableCell
                    value={data.rq_notes}
                    onSave={(v) => updateCell(data.id, 'rq_notes', v)}
                    type="text"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      {chartSeries.length > 0 && (
        <LineChart
          series={chartSeries}
          title="Trend RQ w Czasie (Top 5)"
        />
      )}
    </div>
  );
}
