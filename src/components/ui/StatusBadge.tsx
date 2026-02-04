import type { ApplicationStatus } from '../../types';
import { getStatusOption } from '../../lib/statusConfig';

interface StatusBadgeProps {
    status: ApplicationStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusOption = getStatusOption(status);

    return (
        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 shadow-sm transition-all ${statusOption.color}`}>
            <span className="text-base">{statusOption.icon}</span>
            <span>{statusOption.label}</span>
        </span>
    );
};
