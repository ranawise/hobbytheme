import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import { CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import tw from 'twin.macro';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';

const StatusPill = ({ schedule, className }: { schedule: Schedule; className?: string }) => {
    const label = schedule.isProcessing ? 'Processing' : schedule.isActive ? 'Active' : 'Inactive';
    const colors =
        schedule.isActive && !schedule.isProcessing
            ? tw`bg-green-500/10 text-green-400`
            : tw`bg-neutral-500/10 text-neutral-400`;

    return (
        <p css={[tw`py-1 px-3 rounded-full text-xs font-medium uppercase`, colors]} className={className}>
            {label}
        </p>
    );
};

export default ({ schedule }: { schedule: Schedule }) => (
    <>
        <div css={tw`hidden md:flex flex-shrink-0 items-center justify-center text-neutral-500`}>
            <CalendarClock size={18} />
        </div>
        <div css={tw`flex-1 md:ml-4`}>
            <p css={tw`text-sm font-medium text-neutral-200`}>{schedule.name}</p>
            <p css={tw`text-xs text-neutral-500`}>
                Last run at: {schedule.lastRunAt ? format(schedule.lastRunAt, "MMM do 'at' h:mma") : 'never'}
            </p>
        </div>
        <StatusPill schedule={schedule} className={'sm:hidden'} />
        <ScheduleCronRow cron={schedule.cron} css={tw`mx-auto sm:mx-8 w-full sm:w-auto mt-4 sm:mt-0`} />
        <StatusPill schedule={schedule} className={'hidden sm:block'} />
    </>
);
