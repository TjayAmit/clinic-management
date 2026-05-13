# Dental Clinic Management System - Comprehensive Store

## Overview
This document serves as the comprehensive store and basis for the dental clinic management system, detailing user workflows, data models, business rules, and system requirements.

---

## User Roles & Permissions

### 1. Staff (Receptionist/Admin)
**Primary Usage:** On-field operations, frequent real-time interactions
**Key Responsibilities:**
- Patient intake and registration
- Appointment scheduling and management
- Queue management
- Patient status updates
- Service coordination

**Permissions:**
- Create, read, update patient records
- Create, read, update, delete appointments
- Manage queue assignments
- View all doctor schedules
- Update appointment statuses
- Access patient dental history

### 2. Doctor
**Primary Usage:** Before operations/services for reference and planning
**Key Responsibilities:**
- View assigned patients
- Review patient dental history
- View daily/weekly/monthly schedules
- Perform dental procedures
- Update treatment records

**Permissions:**
- View assigned patients
- View patient dental records
- View own schedule
- Update treatment records (procedure notes)
- Mark appointments as completed

### 3. Patient
**Primary Usage:** Self-service (optional future feature)
**Key Responsibilities:**
- View own appointments
- View treatment history

---

## Core Workflows

### Workflow 1: Patient Intake (Staff)

#### Scenario A: Existing Patient
1. **Patient Arrival**
   - Staff receives patient at clinic
   - System prompts: "Is this an existing or new patient?"

2. **Patient Verification**
   - Staff searches patient by name, phone, or ID
   - System displays patient profile if found

3. **Schedule Check**
   - Staff asks: "Do you have a schedule for today?"
   - System checks existing appointments for current date
   - If appointment exists → Proceed to Workflow 3 (Queue Management)
   - If no appointment → Proceed to step 4

4. **Walk-in Offer**
   - Staff asks: "Would you like to walk in today?"
   - If yes → Proceed to Service Selection
   - If no → Offer to schedule future appointment

5. **Service Selection**
   - Staff asks: "What services would you like to avail?"
   - System displays available services
   - Staff selects service(s)

6. **Service Classification**
   - System auto-classifies service:
     - **Single Visit Services:** Tooth extraction, cleaning, filling, etc.
     - **Long-term Services:** Braces, orthodontics, root canal (multi-visit), etc.

7. **Doctor Assignment**
   - For walk-in → Assign to available doctor for today
   - For long-term services → Assign to doctor for future appointments
   - Staff confirms assignment

8. **Queue Addition**
   - If walk-in → Add to today's queue
   - If scheduled → Create appointment series

#### Scenario B: New Patient
1. **Patient Registration**
   - Staff creates new patient profile
   - Required fields: Name, contact info, age, gender

2. **Patient Interview**
   - Staff conducts dental health interview
   - Capture: Dental history, current issues, medications, allergies

3. **Dental Health Assessment**
   - Staff records initial dental health status
   - Note any visible issues or concerns

4. **Service Selection**
   - Staff asks: "What services would you like to avail?"
   - System displays available services
   - Staff selects service(s)

5. **Service Classification**
   - System auto-classifies service (single visit vs long-term)

6. **Doctor Assignment**
   - For walk-in → Assign to available doctor for today
   - For long-term services → Assign to doctor for future appointments

7. **Queue Addition**
   - If walk-in → Add to today's queue
   - If scheduled → Create appointment series

---

### Workflow 2: Service Classification & Scheduling

#### Single Visit Services
**Examples:** Tooth extraction, dental cleaning, simple filling
**Characteristics:**
- Can be completed in one session
- Duration: Typically 30-60 minutes
- No follow-up required (unless complications)

**Scheduling:**
- Walk-in: Same day, add to queue
- Scheduled: Book specific time slot

#### Long-term Services
**Examples:** Braces, orthodontics, root canal treatment, dental implants
**Characteristics:**
- Require multiple visits over time
- Duration: Weeks to months
- Follow-up appointments required
- Progress tracking needed

**Scheduling:**
- Initial consultation: Walk-in or scheduled
- Treatment plan: Series of appointments
- Follow-ups: Recurring schedule
- Progress reviews: Regular intervals

---

### Workflow 3: Queue Management (Staff)

1. **Queue Setup**
   - Staff initializes daily queue
   - System displays all walk-in patients for the day
   - System displays scheduled patients arriving today

2. **Patient Ordering**
   - Staff sets priority order
   - Factors: Arrival time, urgency, service type
   - System maintains queue sequence

3. **Queue Display**
   - Real-time queue visible to staff
   - Optional: Display in waiting area for patients

4. **Queue Updates**
   - When patient called → Update status to "In Progress"
   - When patient leaves → Update status to "Completed" or "No Show"
   - Reorder as needed

---

### Workflow 4: Doctor Operations

1. **View Next Patient**
   - Doctor accesses system before procedure
   - System displays next patient in queue
   - Shows: Patient name, service type, teeth involved

2. **Review Patient Information**
   - Doctor views patient dental history
   - Reviews previous treatments
   - Checks for allergies/contraindications

3. **Perform Procedure**
   - Doctor conducts dental service
   - System used for reference only during procedure

4. **Update Treatment Record**
   - After procedure, doctor updates notes
   - Records: Procedure performed, teeth treated, observations
   - Marks appointment as completed

5. **Schedule Follow-up (if needed)**
   - For long-term services → Schedule next appointment
   - Staff creates next appointment in series

---

### Workflow 5: Schedule Management

#### Doctor Schedule Views
1. **Daily View**
   - Today's appointments
   - Time slots
   - Patient names and services

2. **Weekly View**
   - 7-day calendar
   - All appointments for the week
   - Color-coded by service type

3. **Monthly View**
   - Full month calendar
   - All appointments
   - Overview of workload

#### Staff Schedule Management
1. **Create Appointment**
   - Select patient
   - Select service
   - Select date/time
   - Assign doctor
   - Confirm

2. **Modify Appointment**
   - Reschedule
   - Change service
   - Reassign doctor
   - Cancel

3. **Appointment Series**
   - For long-term services
   - Create recurring appointments
   - Set frequency (weekly, monthly, etc.)
   - Set end date or number of sessions

---

### Workflow 6: Appointment Status Updates (Staff)

1. **Patient Completion**
   - Doctor finishes procedure
   - Staff updates appointment status to "Completed"

2. **Next Schedule**
   - For ongoing treatment
   - Staff marks appointment as "Needs Follow-up"
   - Creates next appointment
   - Links to previous appointment

3. **Cancellation/No Show**
   - Staff updates status accordingly
   - Notes reason if available

4. **Visit Conclusion**
   - Status update marks end of patient visit
   - System logs completion time
   - Ready for next patient

---

## Data Models

### Patient
```php
- id: UUID
- first_name: string
- last_name: string
- phone: string
- email: string (optional)
- date_of_birth: date
- gender: enum (male, female, other)
- address: text (optional)
- emergency_contact: string (optional)
- dental_health_status: text
- allergies: text (optional)
- medications: text (optional)
- created_at: timestamp
- updated_at: timestamp
```

### Service
```php
- id: UUID
- name: string
- description: text
- category: enum (single_visit, long_term)
- duration_minutes: integer
- base_price: decimal
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
```

### Appointment
```php
- id: UUID
- patient_id: UUID (foreign key)
- doctor_id: UUID (foreign key)
- service_id: UUID (foreign key)
- scheduled_date: date
- scheduled_time: time
- status: enum (scheduled, in_queue, in_progress, completed, cancelled, no_show, needs_follow_up)
- is_walk_in: boolean
- teeth_involved: json (array of tooth numbers)
- notes: text
- parent_appointment_id: UUID (for series, foreign key)
- created_at: timestamp
- updated_at: timestamp
```

### Doctor
```php
- id: UUID
- user_id: UUID (foreign key to users table)
- first_name: string
- last_name: string
- specialization: string
- is_active: boolean
- created_at: timestamp
- updated_at: timestamp
```

### Queue
```php
- id: UUID
- appointment_id: UUID (foreign key)
- queue_date: date
- position: integer
- status: enum (waiting, in_progress, completed, no_show)
- called_at: timestamp (nullable)
- completed_at: timestamp (nullable)
- created_at: timestamp
- updated_at: timestamp
```

### TreatmentRecord
```php
- id: UUID
- appointment_id: UUID (foreign key)
- doctor_id: UUID (foreign key)
- procedure_performed: text
- teeth_treated: json (array of tooth numbers)
- observations: text
- notes: text
- created_at: timestamp
- updated_at: timestamp
```

---

## Business Rules

### Patient Intake Rules
1. Every patient must be classified as "existing" or "new" upon arrival
2. Existing patients must be verified before proceeding
3. New patients must complete registration and initial interview
4. Service classification (single vs long-term) determines scheduling approach

### Appointment Rules
1. Single visit services can be completed in one appointment
2. Long-term services require appointment series
3. Walk-in patients are added to same-day queue
4. Scheduled patients have fixed time slots
5. Appointments can be rescheduled with staff approval

### Queue Rules
1. Queue order is determined by staff based on arrival time and urgency
2. Only one patient can be "in_progress" per doctor at a time
3. Queue status must be updated when patient state changes
4. Queue resets daily

### Doctor Assignment Rules
1. Walk-in patients assigned to available doctors for same-day
2. Long-term services assigned to specific doctor for consistency
3. Doctors can view only their assigned patients
4. Doctors can view their own schedules

### Status Transition Rules
```
Scheduled → In Queue → In Progress → Completed
Scheduled → Cancelled
Scheduled → No Show
In Progress → Needs Follow-up → Scheduled (next appointment)
```

---

## System Features

### Staff Features
1. **Patient Management**
   - Search existing patients
   - Register new patients
   - View patient profiles
   - Edit patient information

2. **Appointment Management**
   - Create appointments
   - Schedule walk-ins
   - Create appointment series
   - Reschedule appointments
   - Cancel appointments

3. **Queue Management**
   - Initialize daily queue
   - Add patients to queue
   - Reorder queue
   - Update queue status
   - View real-time queue

4. **Schedule Management**
   - View all doctor schedules
   - Assign doctors to appointments
   - Manage appointment series

5. **Status Updates**
   - Update appointment status
   - Mark appointments complete
   - Schedule follow-ups

### Doctor Features
1. **Patient View**
   - View next patient in queue
   - View patient dental history
   - View treatment records

2. **Schedule View**
   - Daily schedule
   - Weekly schedule
   - Monthly schedule

3. **Treatment Recording**
   - Add procedure notes
   - Record teeth treated
   - Add observations

### System-wide Features
1. **Dashboard**
   - Today's overview
   - Active queue
   - Upcoming appointments

2. **Reporting**
   - Daily patient count
   - Appointment statistics
   - Service utilization

3. **Notifications**
   - Appointment reminders (future)
   - Queue updates (future)

---

## UI/UX Considerations

### Staff Interface
- **Mobile-friendly** for on-field use
- **Quick search** for patient lookup
- **One-click actions** for common tasks
- **Real-time queue display** with status indicators
- **Clear service categorization** visuals

### Doctor Interface
- **Clean, minimal design** for quick reference
- **Patient summary cards** with key information
- **Calendar views** for schedules
- **Treatment history timeline**
- **Easy note-taking** interface

### Color Coding
- **Green:** Completed/Available
- **Yellow:** In Progress/Waiting
- **Red:** Cancelled/No Show/Urgent
- **Blue:** Scheduled
- **Purple:** Long-term service

---

## API Endpoints (Conceptual)

### Patients
- `GET /api/patients` - List patients
- `POST /api/patients` - Create patient
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient
- `GET /api/patients/search` - Search patients

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment
- `POST /api/appointments/{id}/complete` - Mark complete
- `POST /api/appointments/{id}/follow-up` - Schedule follow-up

### Queue
- `GET /api/queue/today` - Get today's queue
- `POST /api/queue` - Add to queue
- `PUT /api/queue/{id}` - Update queue position/status
- `DELETE /api/queue/{id}` - Remove from queue

### Doctors
- `GET /api/doctors` - List doctors
- `GET /api/doctors/{id}/schedule` - Get doctor schedule
- `GET /api/doctors/{id}/schedule/day` - Daily schedule
- `GET /api/doctors/{id}/schedule/week` - Weekly schedule
- `GET /api/doctors/{id}/schedule/month` - Monthly schedule

### Services
- `GET /api/services` - List services
- `GET /api/services/{id}` - Get service details

### Treatment Records
- `POST /api/treatment-records` - Create treatment record
- `GET /api/appointments/{id}/treatment-records` - Get treatment history

---

## Future Enhancements

1. **Patient Portal**
   - Online appointment booking
   - Treatment history access
   - Appointment reminders

2. **Advanced Scheduling**
   - Automated appointment reminders
   - Recurring appointment templates
   - Conflict detection

3. **Analytics**
   - Treatment success rates
   - Patient retention metrics
   - Revenue tracking

4. **Integration**
   - Payment gateway
   - Insurance verification
   - Digital X-rays integration

5. **Mobile Apps**
   - Dedicated staff mobile app
   - Doctor tablet app

---

## Summary

This comprehensive store defines the complete dental clinic management system based on the user story. The system is designed to:

- **Streamline patient intake** with clear workflows for existing and new patients
- **Classify services appropriately** for single-visit vs long-term treatments
- **Manage queues efficiently** for walk-in patients
- **Provide doctors** with essential information before procedures
- **Track appointments** through complete lifecycle
- **Support both staff** (heavy on-field use) and **doctors** (reference/planning use)

The data models, business rules, and workflows provide a solid foundation for system development, ensuring all user requirements are met while maintaining flexibility for future enhancements.
