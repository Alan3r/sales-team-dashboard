import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { useMongoStorage } from '@/hooks/useMongoStorage';
import { Member, WeekData, StructureChange, DAYS, DAY_NAMES } from '@/types/dashboard';
import { getMonday, getWeekNumber, formatDateRange, addWeeks, formatDateTime } from '@/lib/dateUtils';
import { EditableCell } from './EditableCell';
import { AddMemberModal } from './AddMemberModal';
import { Button } from '@/components/ui/button';

interface CurrentWeekProps {
  showToast: (message: string) => void;
}

export function CurrentWeek({ showToast }: CurrentWeekProps) {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const members = useMongoStorage<Member>('members');
  const weekData = useMongoStorage<WeekData>('weeks');
  const changes = useMongoStorage<StructureChange>('changes');

  const currentWeekData = weekData.data.filter(
    w => new Date(w.week_start).getTime() === currentMonday.getTime()
  );

  const hasNextWeek = weekData.data.some(
    w => new Date(w.week_start).getTime() === addWeeks(currentMonday, 1).getTime()
  );

  const hasPrevWeek = weekData.data.some(
    w => new Date(w.week_start).getTime() === addWeeks(currentMonday, -1).getTime()
  );

  const goToPrevWeek = () => {
    if (hasPrevWeek) {
      setCurrentMonday(addWeeks(currentMonday, -1));
    }
  };

  const goToNextWeek = () => {
    if (hasNextWeek) {
      setCurrentMonday(addWeeks(currentMonday, 1));
    }
  };

  const createNewWeek = () => {
    const newMonday = getMonday(new Date());
    const weekExists = weekData.data.some(
      w => new Date(w.week_start).getTime() === newMonday.getTime()
    );

    if (weekExists) {
      showToast('Ten tydzień już istnieje!');
      return;
    }

    members.data.forEach(member => {
      const newData: WeekData = {
        id: `${member.id}_${newMonday.toISOString()}`,
        type: 'week_data',
        name: member.name,
        role: member.role,
        leader_id: member.leader_id,
        week_start: newMonday.toISOString(),
        week_number: getWeekNumber(newMonday),
        year: newMonday.getFullYear(),
        goal: 0,
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        rq_monday: '',
        rq_tuesday: '',
        rq_wednesday: '',
        rq_thursday: '',
        rq_friday: '',
        rq_notes: '',
      };
      weekData.addItem(newData);
    });

    setCurrentMonday(newMonday);
    showToast('Nowy tydzień został utworzony!');
  };

  const updateCell = async (id: string, field: string, value: number | string) => {
    weekData.updateItem(id, { [field]: value });
  };

  const handleDelete = (id: string) => {
    if (deletingId === id) {
      const member = members.data.find(m => m.id === id);
      if (member) {
        members.deleteItem(id);
        weekData.data
          .filter(w => w.id.startsWith(id))
          .forEach(w => weekData.deleteItem(w.id));
        
        changes.addItem({
          id: `change_${Date.now()}`,
          type: 'structure_change',
          action: 'Usunięto członka zespołu',
          details: `${member.name} - ${member.role}`,
          timestamp: new Date().toISOString(),
        });
        
        showToast('Członek zespołu został usunięty');
      }
      setDeletingId(null);
    } else {
      setDeletingId(id);
      setTimeout(() => setDeletingId(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="card-surface p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={goToPrevWeek}
              disabled={!hasPrevWeek}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Poprzedni tydzień
            </Button>
            
            <div className="text-xl font-semibold">
              {formatDateRange(currentMonday)}
            </div>

            <Button
              onClick={goToNextWeek}
              disabled={!hasNextWeek}
              variant="outline"
              size="sm"
            >
              Następny tydzień
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <Button onClick={createNewWeek} className="bg-primary hover:bg-primary/90">
            <Check className="mr-2 h-4 w-4" />
            Zakończ Tydzień & Nowy
          </Button>
        </div>
      </div>

      {/* Add Member Button */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        DODAJ CZŁONKA ZESPOŁU
      </Button>

      {/* Table */}
      <div className="card-surface overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">Imię i Nazwisko</th>
              <th className="px-4 py-3 text-left font-semibold">Rola</th>
              <th className="px-4 py-3 text-center font-semibold">Cel</th>
              {DAY_NAMES.map(day => (
                <th key={day} className="px-4 py-3 text-center font-semibold">{day}</th>
              ))}
              <th className="px-4 py-3 text-center font-semibold">Suma</th>
              <th className="px-4 py-3 text-center font-semibold">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {currentWeekData.map(data => {
              const sum = DAYS.reduce((acc, day) => acc + (data[day] || 0), 0);
              return (
                <tr key={data.id} className="border-b border-border hover:bg-background-secondary/30 transition-colors">
                  <td className="px-4 py-3">{data.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium bg-role-${data.role.toLowerCase().replace(' ', '-')}/20 text-role-${data.role.toLowerCase().replace(' ', '-')}`}>
                      {data.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <EditableCell
                      value={data.goal}
                      onSave={(v) => updateCell(data.id, 'goal', v)}
                      type="number"
                    />
                  </td>
                  {DAYS.map(day => (
                    <td key={day} className="px-4 py-3 text-center">
                      <EditableCell
                        value={data[day]}
                        onSave={(v) => updateCell(data.id, day, v)}
                        type="number"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-semibold text-primary">{sum}</td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      onClick={() => handleDelete(data.id.split('_')[0])}
                      variant={deletingId === data.id.split('_')[0] ? "destructive" : "outline"}
                      size="sm"
                    >
                      {deletingId === data.id.split('_')[0] ? 'Potwierdź?' : 'Usuń'}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onAdd={(member) => {
            members.addItem(member);
            changes.addItem({
              id: `change_${Date.now()}`,
              type: 'structure_change',
              action: 'Dodano nowego członka zespołu',
              details: `${member.name} - ${member.role}${member.leader_id ? ` (przełożony: ${members.data.find(m => m.id === member.leader_id)?.name})` : ''}`,
              timestamp: new Date().toISOString(),
            });
            showToast('Członek zespołu został dodany!');
            setShowAddModal(false);
          }}
          members={members.data}
        />
      )}
    </div>
  );
}
