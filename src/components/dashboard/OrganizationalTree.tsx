import { Member, ROLE_COLORS } from '@/types/dashboard';
import { Users } from 'lucide-react';

interface OrganizationalTreeProps {
  members: Member[];
  onMemberClick: (id: string) => void;
}

export function OrganizationalTree({ members, onMemberClick }: OrganizationalTreeProps) {
  const getSubordinates = (leaderId: string) => {
    return members.filter(m => m.leader_id === leaderId);
  };

  const renderMember = (member: Member, level = 0) => {
    const subordinates = getSubordinates(member.id);
    const roleColorClass = ROLE_COLORS[member.role];

    return (
      <div key={member.id} className="mb-4">
        <div
          onClick={() => onMemberClick(member.id)}
          className={`card-surface p-4 hover-lift cursor-pointer border-l-4 border-${roleColorClass}`}
          style={{ marginLeft: level * 40 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-lg">{member.name}</div>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-${roleColorClass}/20 text-${roleColorClass}`}>
                {member.role}
              </span>
            </div>
            {subordinates.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{subordinates.length}</span>
              </div>
            )}
          </div>
        </div>
        {subordinates.map(sub => renderMember(sub, level + 1))}
      </div>
    );
  };

  const topLevel = members.filter(m => !m.leader_id);

  return (
    <div className="space-y-4">
      {topLevel.map(member => renderMember(member))}
    </div>
  );
}
