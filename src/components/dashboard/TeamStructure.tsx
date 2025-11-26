import { useState } from 'react';
import { useMongoStorage } from '@/hooks/useMongoStorage';
import { Member, StructureChange } from '@/types/dashboard';
import { formatDateTime } from '@/lib/dateUtils';
import { OrganizationalTree } from './OrganizationalTree';
import { MemberStatsModal } from './MemberStatsModal';

export function TeamStructure() {
  const members = useMongoStorage<Member>('members');
  const changes = useMongoStorage<StructureChange>('changes');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const sortedChanges = [...changes.data].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-8">
      {/* History */}
      <div className="card-surface p-6">
        <h2 className="text-xl font-semibold mb-4">Historia Zmian Struktury</h2>
        <div className="space-y-3">
          {sortedChanges.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Brak zmian w historii</p>
          ) : (
            sortedChanges.map(change => (
              <div
                key={change.id}
                className="flex gap-4 p-4 bg-background-secondary/30 rounded-lg hover:bg-background-secondary/50 transition-colors"
              >
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDateTime(new Date(change.timestamp))}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{change.action}</div>
                  <div className="text-sm text-muted-foreground mt-1">{change.details}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Organizational Tree */}
      <div className="card-surface p-6">
        <h2 className="text-xl font-semibold mb-6">Drzewo Organizacyjne</h2>
        {members.data.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Brak członków zespołu. Dodaj pierwszego członka w zakładce "Bieżący Tydzień".
          </p>
        ) : (
          <OrganizationalTree
            members={members.data}
            onMemberClick={setSelectedMemberId}
          />
        )}
      </div>

      {selectedMemberId && (
        <MemberStatsModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
        />
      )}
    </div>
  );
}
