create table appointment (
    id uuid primary key,
    patient_id uuid not null references patient_profile (id),
    hospital_id uuid not null references organization (id),
    clinician_user_id uuid references user_account (id),
    appointment_status varchar(30) not null,
    reason varchar(250) not null,
    scheduled_at timestamp not null,
    created_at timestamp not null default current_timestamp
);

insert into organization (id, organization_type, code, name, parent_organization_id)
values
    ('11111111-1111-1111-1111-111111111111', 'MINISTRY', 'MOH-NG', 'Federal Ministry of Health', null),
    ('22222222-2222-2222-2222-222222222222', 'HOSPITAL', 'HOSP-001', 'Structure Health General Hospital', null),
    ('33333333-3333-3333-3333-333333333333', 'HMO', 'HMO-001', 'Structure Health HMO', null);

insert into department (id, organization_id, code, name, department_type)
values
    ('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222', 'FRONTDESK', 'Front Desk', 'OPERATIONS'),
    ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'CLINIC', 'Outpatient Clinic', 'CLINICAL'),
    ('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222222', 'BILLING', 'Billing Office', 'FINANCE');

insert into user_account (id, organization_id, department_id, platform_role, email, full_name, status)
values
    ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444442', 'CLINICIAN', 'doctor@structurehealth.local', 'Dr. Amaka Obi', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444443', 'HOSPITAL_BILLING', 'billing@structurehealth.local', 'Bola Yusuf', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444441', 'PATIENT', 'patient@structurehealth.local', 'Amina Hassan', 'ACTIVE');

insert into patient_profile (id, user_account_id, global_patient_number, insurance_member_number, gender, date_of_birth, phone_number)
values
    ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555553', 'SHP-0001', 'HMO-10001', 'FEMALE', date '1992-05-12', '+2348000000001');

insert into appointment (id, patient_id, hospital_id, clinician_user_id, appointment_status, reason, scheduled_at)
values
    ('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'SCHEDULED', 'Post-surgery review', current_timestamp + interval '2 day');

insert into encounter (id, patient_id, hospital_id, attending_user_id, journey_stage, status, opened_at, closed_at)
values
    ('88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'CONSULTATION', 'OPEN', current_timestamp - interval '1 day', null);

insert into patient_message_thread (id, patient_id, hospital_id, encounter_id, subject, thread_status)
values
    ('99999999-9999-9999-9999-999999999991', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888881', 'Follow-up clarification', 'OPEN');

insert into patient_message (id, thread_id, sender_patient_id, message_type, body)
values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '99999999-9999-9999-9999-999999999991', '66666666-6666-6666-6666-666666666661', 'TEXT', 'Please confirm when to return for my dressing review.');

insert into claim_case (id, encounter_id, hospital_id, hmo_id, claim_status, total_amount, approved_amount, submitted_at, settled_at)
values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '88888888-8888-8888-8888-888888888881', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'SUBMITTED', 85000.00, null, current_timestamp - interval '12 hour', null);

insert into reconciliation_case (id, claim_case_id, patient_position, hospital_position, hmo_position, variance_amount, reconciliation_status)
values
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'CLEAR', 'SUBMITTED', 'UNDER_REVIEW', 15000.00, 'OPEN');
