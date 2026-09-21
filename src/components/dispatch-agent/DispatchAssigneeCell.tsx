'use client';

interface DispatchAssigneeCellProps {
  assignee?: { name: string; department: string } | null;
  loading?: boolean;
  inline?: boolean;
  onChangeAssignee?: () => void;
}

export default function DispatchAssigneeCell({
  assignee,
  loading = false,
  inline = false,
  onChangeAssignee,
}: DispatchAssigneeCellProps) {
  if (loading) {
    return <span className="text-xs text-gray-400">匹配中…</span>;
  }

  return (
    <div className={inline ? 'flex items-center gap-2 whitespace-nowrap' : 'space-y-1'}>
      {assignee ? (
        inline ? (
          <>
            <span>{assignee.name}</span>
            <span className="text-xs text-gray-500">{assignee.department}</span>
          </>
        ) : (
          <div>
            <div>{assignee.name}</div>
            <div className="text-xs text-gray-500">{assignee.department}</div>
          </div>
        )
      ) : (
        <span className="text-sm text-gray-400">—</span>
      )}
      {onChangeAssignee && (
        <button
          type="button"
          onClick={onChangeAssignee}
          className="text-xs text-blue-600 hover:text-blue-700"
        >
          {assignee ? '更换' : '选择人员'}
        </button>
      )}
    </div>
  );
}
