import { useState } from 'react';
import { X } from 'lucide-react';
import { Member, Role } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddMemberModalProps {
  onClose: () => void;
  onAdd: (member: Member) => void;
  members: Member[];
}

const ROLES: Role[] = ["NS", "Brand Ambassador", "Leader", "Crew Leader", "Assistant"];

export function AddMemberModal({ onClose, onAdd, members }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [leaderId, setLeaderId] = useState('none');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    setLoading(true);
    
    setTimeout(() => {
      onAdd({
        id: `member_${Date.now()}`,
        type: 'member',
        name,
        role,
        leader_id: leaderId === 'none' ? '' : leaderId,
      });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card-surface p-6 max-w-md w-full animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dodaj Członka Zespołu</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Imię i Nazwisko *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jan Kowalski"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role">Rola *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Wybierz rolę" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="leader">Przypisz do Przełożonego</Label>
            <Select value={leaderId} onValueChange={setLeaderId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Brak (Top Level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Brak (Top Level)</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} - {m.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">
              Anuluj
            </Button>
            <Button type="submit" disabled={loading || !name || !role} className="flex-1 bg-primary hover:bg-primary/90">
              {loading ? 'Dodawanie...' : 'Dodaj'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
