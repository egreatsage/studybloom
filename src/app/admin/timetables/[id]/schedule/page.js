'use client';

import { useParams } from 'next/navigation';
import LectureScheduler from '@/components/admin/LectureScheduler';

export default function SchedulePage() {
  const params = useParams();
  const timetableId = params.id;

  return (
    <div>
      <LectureScheduler timetableId={timetableId} />
    </div>
  );
}
