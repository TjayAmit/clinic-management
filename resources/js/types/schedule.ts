import type { Appointment } from './appointments';
import type { Doctor } from './doctors';

export interface ScheduleIndexProps {
    appointments: Appointment[];
    date: string;
    dateLabel: string;
}

export interface DoctorCalendarProps {
    doctor: Doctor;
    appointments: Record<string, Appointment[]>;
    month: string;
    monthLabel: string;
    year: number;
    daysInMonth: number;
    startDay: number;
}
