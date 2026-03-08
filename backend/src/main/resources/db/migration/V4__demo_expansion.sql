insert into department (id, organization_id, code, name, department_type)
values
    ('44444444-4444-4444-4444-444444444446', '22222222-2222-2222-2222-222222222222', 'WARD', 'Observation Ward', 'INPATIENT')
on conflict do nothing;

insert into patient_profile (id, user_account_id, global_patient_number, insurance_member_number, gender, date_of_birth, phone_number)
values
    ('66666666-6666-6666-6666-666666666662', null, 'SHP-0002', 'HMO-10002', 'MALE', date '1985-09-03', '+2348000000002'),
    ('66666666-6666-6666-6666-666666666663', null, 'SHP-0003', 'HMO-10003', 'FEMALE', date '2001-02-19', '+2348000000003'),
    ('66666666-6666-6666-6666-666666666664', null, 'SHP-0004', 'HMO-10004', 'MALE', date '1974-11-28', '+2348000000004')
on conflict do nothing;

insert into appointment (id, patient_id, hospital_id, clinician_user_id, appointment_status, reason, scheduled_at)
values
    ('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666662', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'CHECKED_IN', 'Diabetes medication review', current_timestamp + interval '3 hour'),
    ('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'SCHEDULED', 'Virtual consultation request', current_timestamp + interval '1 day'),
    ('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666664', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'COMPLETED', 'Hypertension follow-up', current_timestamp - interval '2 day')
on conflict do nothing;

insert into encounter (id, patient_id, hospital_id, attending_user_id, journey_stage, status, opened_at, closed_at)
values
    ('88888888-8888-8888-8888-888888888882', '66666666-6666-6666-6666-666666666662', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'TRIAGE', 'IN_PROGRESS', current_timestamp - interval '2 hour', null),
    ('88888888-8888-8888-8888-888888888883', '66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'LAB', 'PENDING', current_timestamp - interval '6 hour', null),
    ('88888888-8888-8888-8888-888888888884', '66666666-6666-6666-6666-666666666664', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'DISCHARGE', 'CLOSED', current_timestamp - interval '3 day', current_timestamp - interval '2 day')
on conflict do nothing;

insert into patient_message_thread (id, patient_id, hospital_id, encounter_id, subject, thread_status, created_at)
values
    ('99999999-9999-9999-9999-999999999992', '66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222222', null, 'Virtual consultation request', 'OPEN', current_timestamp - interval '4 hour')
on conflict do nothing;

insert into patient_message (id, thread_id, sender_user_id, sender_patient_id, message_type, body, sent_at)
values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555554', null, 'TEXT', 'Please come back on Tuesday morning for your wound assessment.', current_timestamp - interval '17 hour'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '99999999-9999-9999-9999-999999999992', null, '66666666-6666-6666-6666-666666666663', 'TEXT', 'Can this review be handled as a video visit?', current_timestamp - interval '3 hour')
on conflict do nothing;

insert into virtual_consultation (id, patient_id, encounter_id, hospital_id, clinician_user_id, consultation_status, session_mode, scheduled_start, scheduled_end, meeting_reference, calendar_sync_status, created_at)
values
    ('abababab-abab-abab-abab-abababababab', '66666666-6666-6666-6666-666666666663', '88888888-8888-8888-8888-888888888883', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'SCHEDULED', 'VIDEO', current_timestamp + interval '1 day', current_timestamp + interval '1 day 30 minute', 'telehealth-room-001', 'SYNCED', current_timestamp - interval '2 hour')
on conflict do nothing;

insert into claim_case (id, encounter_id, hospital_id, hmo_id, claim_status, total_amount, approved_amount, submitted_at, settled_at)
values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '88888888-8888-8888-8888-888888888883', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'UNDER_REVIEW', 45000.00, null, current_timestamp - interval '5 hour', null),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '88888888-8888-8888-8888-888888888884', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'APPROVED', 120000.00, 118000.00, current_timestamp - interval '3 day', current_timestamp - interval '2 day')
on conflict do nothing;

insert into reconciliation_case (id, claim_case_id, patient_position, hospital_position, hmo_position, variance_amount, reconciliation_status, updated_at)
values
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'CLEAR', 'SUBMITTED', 'UNDER_REVIEW', 5000.00, 'OPEN', current_timestamp - interval '4 hour'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'CLEAR', 'ALIGNED', 'ALIGNED', 0.00, 'CLOSED', current_timestamp - interval '2 day')
on conflict do nothing;

insert into inventory_item (id, organization_id, sku, item_name, item_category, unit_of_measure, quantity_on_hand, reorder_level, inventory_status, updated_at)
values
    ('dddddddd-dddd-dddd-dddd-ddddddddddd4', '22222222-2222-2222-2222-222222222222', 'CONS-GLOVE', 'Sterile gloves', 'CONSUMABLE', 'PACK', 64.00, 24.00, 'AVAILABLE', current_timestamp - interval '2 hour'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd5', '22222222-2222-2222-2222-222222222222', 'MED-AMLO-5', 'Amlodipine 5mg', 'MEDICATION', 'TABLET', 240.00, 80.00, 'AVAILABLE', current_timestamp - interval '2 hour')
on conflict do nothing;

insert into inventory_movement (id, inventory_item_id, movement_type, quantity, reference_entity_type, reference_entity_id, notes, moved_by_user_id, moved_at)
values
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 'ISSUE', 1.00, 'TASK', 'f3333333-3333-3333-3333-333333333333', 'Issued for CBC processing', '55555555-5555-5555-5555-555555555555', current_timestamp - interval '8 hour'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'dddddddd-dddd-dddd-dddd-ddddddddddd5', 'ISSUE', 14.00, 'ENCOUNTER', '88888888-8888-8888-8888-888888888884', 'Dispensed during hypertension follow-up', '55555555-5555-5555-5555-555555555556', current_timestamp - interval '2 day')
on conflict do nothing;

insert into triage_assessment (id, encounter_id, recorded_by_user_id, acuity_level, chief_complaint, temperature_c, systolic_bp, diastolic_bp, heart_rate, respiratory_rate, oxygen_saturation, weight_kg, notes, recorded_at)
values
    ('f1111111-1111-1111-1111-111111111112', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555554', 'HIGH', 'Dizziness and elevated blood sugar review', 36.9, 138, 90, 96, 20, 97, 79.40, 'Needs urgent clinician review before discharge from triage.', current_timestamp - interval '90 minute'),
    ('f1111111-1111-1111-1111-111111111113', '88888888-8888-8888-8888-888888888884', '55555555-5555-5555-5555-555555555554', 'LOW', 'Routine blood pressure follow-up', 36.7, 132, 84, 76, 16, 99, 81.10, 'Stable vital signs during follow-up encounter.', current_timestamp - interval '3 day')
on conflict do nothing;

insert into consultation_note (id, encounter_id, clinician_user_id, diagnosis, clinical_notes, care_plan, follow_up_instruction, recorded_at)
values
    ('f2222222-2222-2222-2222-222222222223', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555551', 'Type 2 diabetes review with symptomatic hyperglycaemia', 'Patient reports dizziness and missed two doses in the last week.', 'Check random blood sugar, reinforce medication adherence, and refill oral medication.', 'Review again in two weeks with glucose diary.', current_timestamp - interval '70 minute'),
    ('f2222222-2222-2222-2222-222222222224', '88888888-8888-8888-8888-888888888884', '55555555-5555-5555-5555-555555555551', 'Controlled hypertension follow-up', 'Blood pressure improved compared with last visit and no red flag symptoms.', 'Continue current antihypertensive regimen and lifestyle modification.', 'Return in one month for pressure check.', current_timestamp - interval '3 day')
on conflict do nothing;

insert into department_task (id, encounter_id, patient_id, department_type, task_title, task_details, task_status, requested_by_user_id, assigned_to_user_id, inventory_item_id, quantity_requested, updated_at)
values
    ('f3333333-3333-3333-3333-333333333334', '88888888-8888-8888-8888-888888888882', '66666666-6666-6666-6666-666666666662', 'NURSING', 'Blood sugar monitoring', 'Repeat random blood sugar and monitor symptoms before clinician review.', 'IN_PROGRESS', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555554', null, null, current_timestamp - interval '80 minute'),
    ('f3333333-3333-3333-3333-333333333335', '88888888-8888-8888-8888-888888888883', '66666666-6666-6666-6666-666666666663', 'LAB', 'Pregnancy hormone review', 'Confirm lab result before switching to a scheduled virtual follow-up.', 'REQUESTED', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 1.00, current_timestamp - interval '5 hour'),
    ('f3333333-3333-3333-3333-333333333336', '88888888-8888-8888-8888-888888888884', '66666666-6666-6666-6666-666666666664', 'PHARMACY', 'Amlodipine refill', 'Dispense 30 tablets for one-month follow-up.', 'COMPLETED', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555556', 'dddddddd-dddd-dddd-dddd-ddddddddddd5', 30.00, current_timestamp - interval '2 day')
on conflict do nothing;

insert into discharge_plan (id, encounter_id, discharge_status, disposition, summary_notes, medication_notes, follow_up_date, discharged_by_user_id, updated_at)
values
    ('f5555555-5555-5555-5555-555555555556', '88888888-8888-8888-8888-888888888884', 'COMPLETED', 'HOME_CARE', 'Patient stable for discharge after blood pressure review and medication reconciliation.', 'Continue amlodipine once daily and keep home BP log.', current_date + interval '30 day', '55555555-5555-5555-5555-555555555551', current_timestamp - interval '2 day')
on conflict do nothing;

insert into broadcast_message (id, audience_scope, title, body, published_by, published_at)
values
    ('dededede-dede-dede-dede-dededededed1', 'ALL_USERS', 'Care continuity reminder', 'All departments should close or progress encounters before end-of-day reconciliation.', '55555555-5555-5555-5555-555555555552', current_timestamp - interval '6 hour')
on conflict do nothing;
