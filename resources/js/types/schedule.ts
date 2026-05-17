import type { Appointment } from './appointments';
import type { Doctor, DoctorSchedule } from './doctors';

export interface ScheduleIndexProps {
    appointments: Appointment[];
    date: string;
    dateLabel: string;
}

export interface DoctorCalendarProps {
    doctor: Doctor;
    appointments: Record<string, Appointment[]>;
    schedules: Record<string, DoctorSchedule[]>;
    month: string;
    monthLabel: string;
    year: number;
    daysInMonth: number;
    startDay: number;
}
