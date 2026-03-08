insert into organization (id, organization_type, code, name, parent_organization_id)
values
    ('11111111-1111-1111-1111-111111111111', 'MINISTRY', 'MOH-NG', 'Federal Ministry of Health', null),
    ('22222222-2222-2222-2222-222222222222', 'HOSPITAL', 'HOSP-001', 'Structure Health General Hospital', null),
    ('33333333-3333-3333-3333-333333333333', 'HMO', 'HMO-001', 'Structure Health HMO', null);

insert into department (id, organization_id, code, name, department_type)
values
    ('44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222222', 'FRONTDESK', 'Front Desk', 'OPERATIONS'),
    ('44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222222', 'CLINIC', 'Outpatient Clinic', 'CLINICAL'),
    ('44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222222', 'BILLING', 'Billing Office', 'FINANCE'),
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'LAB', 'Laboratory', 'DIAGNOSTIC'),
    ('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222222', 'PHARM', 'Pharmacy', 'CLINICAL'),
    ('44444444-4444-4444-4444-444444444446', '22222222-2222-2222-2222-222222222222', 'WARD', 'Observation Ward', 'INPATIENT');

insert into user_account (id, organization_id, department_id, platform_role, email, full_name, status)
values
    ('55555555-5555-5555-5555-555555555551', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444442', 'CLINICIAN', 'doctor@structurehealth.local', 'Dr. Amaka Obi', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555552', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444443', 'HOSPITAL_BILLING', 'billing@structurehealth.local', 'Bola Yusuf', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555553', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444441', 'PATIENT', 'patient@structurehealth.local', 'Amina Hassan', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555554', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444441', 'NURSE', 'nurse@structurehealth.local', 'Nneka Eze', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'LAB_SCIENTIST', 'lab@structurehealth.local', 'Samuel Ade', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555556', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444445', 'PHARMACIST', 'pharmacy@structurehealth.local', 'Chioma Ndukwe', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555557', '22222222-2222-2222-2222-222222222222', null, 'PATIENT', 'emeka@structurehealth.local', 'Emeka Okonkwo', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555558', '22222222-2222-2222-2222-222222222222', null, 'PATIENT', 'fatima@structurehealth.local', 'Fatima Bello', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555559', '22222222-2222-2222-2222-222222222222', null, 'PATIENT', 'tunde@structurehealth.local', 'Tunde Adeyemi', 'ACTIVE');

insert into patient_profile (id, user_account_id, global_patient_number, insurance_member_number, gender, date_of_birth, phone_number)
values
    ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555553', 'SHP-0001', 'HMO-10001', 'FEMALE', date '1992-05-12', '+2348000000001'),
    ('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555557', 'SHP-0002', 'HMO-10002', 'MALE', date '1985-09-03', '+2348000000002'),
    ('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555558', 'SHP-0003', 'HMO-10003', 'FEMALE', date '2001-02-19', '+2348000000003'),
    ('66666666-6666-6666-6666-666666666664', '55555555-5555-5555-5555-555555555559', 'SHP-0004', 'HMO-10004', 'MALE', date '1974-11-28', '+2348000000004');

insert into appointment (id, patient_id, hospital_id, clinician_user_id, appointment_status, reason, scheduled_at)
values
    ('77777777-7777-7777-7777-777777777771', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'SCHEDULED', 'Post-surgery review', current_timestamp + interval '2 day'),
    ('77777777-7777-7777-7777-777777777772', '66666666-6666-6666-6666-666666666662', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'CHECKED_IN', 'Diabetes medication review', current_timestamp + interval '3 hour'),
    ('77777777-7777-7777-7777-777777777773', '66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'SCHEDULED', 'Virtual consultation request', current_timestamp + interval '1 day'),
    ('77777777-7777-7777-7777-777777777774', '66666666-6666-6666-6666-666666666664', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'COMPLETED', 'Hypertension follow-up', current_timestamp - interval '2 day');

insert into encounter (id, patient_id, hospital_id, attending_user_id, journey_stage, status, opened_at, closed_at)
values
    ('88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'CONSULTATION', 'OPEN', current_timestamp - interval '1 day', null),
    ('88888888-8888-8888-8888-888888888882', '66666666-6666-6666-6666-666666666662', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'TRIAGE', 'IN_PROGRESS', current_timestamp - interval '2 hour', null),
    ('88888888-8888-8888-8888-888888888883', '66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'LAB', 'PENDING', current_timestamp - interval '6 hour', null),
    ('88888888-8888-8888-8888-888888888884', '66666666-6666-6666-6666-666666666664', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'DISCHARGE', 'CLOSED', current_timestamp - interval '3 day', current_timestamp - interval '2 day');

insert into patient_message_thread (id, patient_id, hospital_id, encounter_id, subject, thread_status, created_at)
values
    ('99999999-9999-9999-9999-999999999991', '66666666-6666-6666-6666-666666666661', '22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888881', 'Follow-up clarification', 'OPEN', current_timestamp - interval '20 hour'),
    ('99999999-9999-9999-9999-999999999992', '66666666-6666-6666-6666-666666666663', '22222222-2222-2222-2222-222222222222', null, 'Virtual consultation request', 'OPEN', current_timestamp - interval '4 hour');

insert into patient_message (id, thread_id, sender_user_id, sender_patient_id, message_type, body, sent_at)
values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '99999999-9999-9999-9999-999999999991', null, '66666666-6666-6666-6666-666666666661', 'TEXT', 'Please confirm when to return for my dressing review.', current_timestamp - interval '18 hour'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555554', null, 'TEXT', 'Please come back on Tuesday morning for your wound assessment.', current_timestamp - interval '17 hour'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '99999999-9999-9999-9999-999999999992', null, '66666666-6666-6666-6666-666666666663', 'TEXT', 'Can this review be handled as a video visit?', current_timestamp - interval '3 hour');

insert into virtual_consultation (id, patient_id, encounter_id, hospital_id, clinician_user_id, consultation_status, session_mode, scheduled_start, scheduled_end, meeting_reference, calendar_sync_status, created_at)
values
    ('abababab-abab-abab-abab-abababababab', '66666666-6666-6666-6666-666666666663', '88888888-8888-8888-8888-888888888883', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', 'SCHEDULED', 'VIDEO', current_timestamp + interval '1 day', current_timestamp + interval '1 day 30 minute', 'telehealth-room-001', 'SYNCED', current_timestamp - interval '2 hour');

insert into claim_case (id, encounter_id, hospital_id, hmo_id, claim_status, total_amount, approved_amount, submitted_at, settled_at)
values
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '88888888-8888-8888-8888-888888888881', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'SUBMITTED', 85000.00, null, current_timestamp - interval '12 hour', null),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '88888888-8888-8888-8888-888888888883', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'UNDER_REVIEW', 45000.00, null, current_timestamp - interval '5 hour', null),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '88888888-8888-8888-8888-888888888884', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'APPROVED', 120000.00, 118000.00, current_timestamp - interval '3 day', current_timestamp - interval '2 day');

insert into reconciliation_case (id, claim_case_id, patient_position, hospital_position, hmo_position, variance_amount, reconciliation_status, updated_at)
values
    ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'CLEAR', 'SUBMITTED', 'UNDER_REVIEW', 15000.00, 'OPEN', current_timestamp - interval '10 hour'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'CLEAR', 'SUBMITTED', 'UNDER_REVIEW', 5000.00, 'OPEN', current_timestamp - interval '4 hour'),
    ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'CLEAR', 'ALIGNED', 'ALIGNED', 0.00, 'CLOSED', current_timestamp - interval '2 day');

insert into inventory_item (id, organization_id, sku, item_name, item_category, unit_of_measure, quantity_on_hand, reorder_level, inventory_status, updated_at)
values
    ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '22222222-2222-2222-2222-222222222222', 'MED-CEF-1G', 'Ceftriaxone 1g', 'MEDICATION', 'VIAL', 42.00, 20.00, 'AVAILABLE', current_timestamp - interval '1 hour'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '22222222-2222-2222-2222-222222222222', 'CONS-DRESS', 'Sterile dressing pack', 'CONSUMABLE', 'PACK', 18.00, 12.00, 'LOW_STOCK', current_timestamp - interval '1 hour'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd3', '22222222-2222-2222-2222-222222222222', 'LAB-CBC', 'CBC reagent kit', 'LAB_SUPPLY', 'KIT', 9.00, 6.00, 'LOW_STOCK', current_timestamp - interval '1 hour'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd4', '22222222-2222-2222-2222-222222222222', 'CONS-GLOVE', 'Sterile gloves', 'CONSUMABLE', 'PACK', 64.00, 24.00, 'AVAILABLE', current_timestamp - interval '2 hour'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd5', '22222222-2222-2222-2222-222222222222', 'MED-AMLO-5', 'Amlodipine 5mg', 'MEDICATION', 'TABLET', 240.00, 80.00, 'AVAILABLE', current_timestamp - interval '2 hour');

insert into inventory_movement (id, inventory_item_id, movement_type, quantity, reference_entity_type, reference_entity_id, notes, moved_by_user_id, moved_at)
values
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'RESTOCK', 50.00, 'INVENTORY_ITEM', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'Opening stock load', '55555555-5555-5555-5555-555555555556', current_timestamp - interval '5 day'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'dddddddd-dddd-dddd-dddd-ddddddddddd2', 'ISSUE', 4.00, 'ENCOUNTER', '88888888-8888-8888-8888-888888888881', 'Used for dressing review follow-up', '55555555-5555-5555-5555-555555555556', current_timestamp - interval '1 day'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 'ISSUE', 1.00, 'TASK', 'f3333333-3333-3333-3333-333333333333', 'Issued for CBC processing', '55555555-5555-5555-5555-555555555555', current_timestamp - interval '8 hour'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'dddddddd-dddd-dddd-dddd-ddddddddddd5', 'ISSUE', 14.00, 'ENCOUNTER', '88888888-8888-8888-8888-888888888884', 'Dispensed during hypertension follow-up', '55555555-5555-5555-5555-555555555556', current_timestamp - interval '2 day');

insert into triage_assessment (id, encounter_id, recorded_by_user_id, acuity_level, chief_complaint, temperature_c, systolic_bp, diastolic_bp, heart_rate, respiratory_rate, oxygen_saturation, weight_kg, notes, recorded_at)
values
    ('f1111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555554', 'MODERATE', 'Post-operative wound review and pain check', 37.4, 126, 82, 88, 18, 98, 64.50, 'Patient walked in comfortably and reports mild dressing discomfort.', current_timestamp - interval '23 hour'),
    ('f1111111-1111-1111-1111-111111111112', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555554', 'HIGH', 'Dizziness and elevated blood sugar review', 36.9, 138, 90, 96, 20, 97, 79.40, 'Needs urgent clinician review before discharge from triage.', current_timestamp - interval '90 minute'),
    ('f1111111-1111-1111-1111-111111111113', '88888888-8888-8888-8888-888888888884', '55555555-5555-5555-5555-555555555554', 'LOW', 'Routine blood pressure follow-up', 36.7, 132, 84, 76, 16, 99, 81.10, 'Stable vital signs during follow-up encounter.', current_timestamp - interval '3 day');

insert into consultation_note (id, encounter_id, clinician_user_id, diagnosis, clinical_notes, care_plan, follow_up_instruction, recorded_at)
values
    ('f2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555551', 'Healing post-operative wound with mild inflammation', 'Wound edges are clean. No purulent discharge. Mild pain on dressing change.', 'Continue ceftriaxone, repeat dressing change, order CBC, and monitor for fever.', 'Return in 5 days or earlier if fever, swelling, or discharge increases.', current_timestamp - interval '22 hour'),
    ('f2222222-2222-2222-2222-222222222223', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555551', 'Type 2 diabetes review with symptomatic hyperglycaemia', 'Patient reports dizziness and missed two doses in the last week.', 'Check random blood sugar, reinforce medication adherence, and refill oral medication.', 'Review again in two weeks with glucose diary.', current_timestamp - interval '70 minute'),
    ('f2222222-2222-2222-2222-222222222224', '88888888-8888-8888-8888-888888888884', '55555555-5555-5555-5555-555555555551', 'Controlled hypertension follow-up', 'Blood pressure improved compared with last visit and no red flag symptoms.', 'Continue current antihypertensive regimen and lifestyle modification.', 'Return in one month for pressure check.', current_timestamp - interval '3 day');

insert into encounter_documentation (
    id,
    encounter_id,
    documented_by_user_id,
    patient_history,
    subjective_notes,
    objective_findings,
    assessment_notes,
    care_plan_notes,
    medication_plan,
    safety_flags,
    next_step_notes,
    updated_at
)
values
    ('f6666666-6666-6666-6666-666666666661', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555551', 'Seven days post abdominal surgery with home dressing changes carried out by caregiver.', 'Patient reports mild wound pain during dressing change with no fever, vomiting, or new swelling.', 'Afebrile, wound edges well approximated, mild peri-wound erythema, no purulent discharge, stable vitals.', 'Improving post-operative wound with mild localized inflammation and no evidence of systemic infection.', 'Continue wound surveillance, complete ordered CBC, reinforce hygiene, and review if symptoms escalate.', 'Ceftriaxone 1g daily for three more doses and analgesics as needed after meals.', 'Watch for fever, increasing swelling, discharge, or severe pain.', 'Dressing review in five days and escalate sooner if red-flag symptoms develop.', current_timestamp - interval '21 hour'),
    ('f6666666-6666-6666-6666-666666666662', '88888888-8888-8888-8888-888888888882', '55555555-5555-5555-5555-555555555551', 'Known type 2 diabetes with recent missed doses and irregular glucose monitoring.', 'Patient complains of dizziness, thirst, and fatigue after missing medication twice within the last week.', 'Triage recorded elevated pulse and blood pressure with no altered mental status and no focal deficits.', 'Symptomatic hyperglycaemia likely driven by poor adherence; requires immediate glucose check and medication reinforcement.', 'Keep under observation, complete bedside glucose monitoring, refill medication, and provide adherence counselling.', 'Resume oral diabetic medication after bedside review and confirm refill before discharge from clinic.', 'High-risk for worsening symptoms if glucose remains uncontrolled or adherence remains poor.', 'Review glucose result today, then schedule structured follow-up with glucose diary in two weeks.', current_timestamp - interval '62 minute'),
    ('f6666666-6666-6666-6666-666666666663', '88888888-8888-8888-8888-888888888883', '55555555-5555-5555-5555-555555555551', 'Patient requested virtual review pending confirmation of hormone test before treatment adjustment.', 'Patient prefers remote follow-up and wants clarification on whether additional in-person assessment is necessary.', 'Current encounter is awaiting laboratory confirmation before switching to telehealth follow-up.', 'Care plan depends on pending lab confirmation; no final treatment change should occur before result validation.', 'Track laboratory turnaround closely, confirm result, and convert to scheduled virtual follow-up once ready.', 'Medication plan deferred until lab result is confirmed.', 'No acute safety concern recorded, but delay in lab turnaround will affect follow-up scheduling.', 'Notify patient once lab result is released and sync confirmed review into the virtual consultation calendar.', current_timestamp - interval '4 hour'),
    ('f6666666-6666-6666-6666-666666666664', '88888888-8888-8888-8888-888888888884', '55555555-5555-5555-5555-555555555551', 'Long-term hypertension follow-up with prior elevated readings now improving on current therapy.', 'Patient denies headache, chest pain, breathlessness, or lower-limb swelling and reports medication adherence.', 'Blood pressure improved versus prior visit, examination stable, and no red-flag cardiovascular symptoms documented.', 'Controlled hypertension on current regimen with good symptom control and no indication for admission.', 'Continue present regimen, reinforce low-salt diet, home BP monitoring, and routine follow-up.', 'Continue amlodipine 5mg once daily with refill supplied for one month.', 'Advise prompt review for severe headache, visual disturbance, chest pain, or markedly elevated home readings.', 'Return in one month with home blood pressure log for routine review.', current_timestamp - interval '3 day');

insert into department_task (id, encounter_id, patient_id, department_type, task_title, task_details, task_status, requested_by_user_id, assigned_to_user_id, inventory_item_id, quantity_requested, updated_at)
values
    ('f3333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', 'LAB', 'Complete blood count', 'CBC requested to rule out infection progression.', 'REQUESTED', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 1.00, current_timestamp - interval '21 hour'),
    ('f4444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', 'PHARMACY', 'Ceftriaxone 1g refill', 'Dispense three doses for wound management continuation.', 'IN_PROGRESS', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555556', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 3.00, current_timestamp - interval '20 hour'),
    ('f3333333-3333-3333-3333-333333333334', '88888888-8888-8888-8888-888888888882', '66666666-6666-6666-6666-666666666662', 'NURSING', 'Blood sugar monitoring', 'Repeat random blood sugar and monitor symptoms before clinician review.', 'IN_PROGRESS', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555554', null, null, current_timestamp - interval '80 minute'),
    ('f3333333-3333-3333-3333-333333333335', '88888888-8888-8888-8888-888888888883', '66666666-6666-6666-6666-666666666663', 'LAB', 'Pregnancy hormone review', 'Confirm lab result before switching to a scheduled virtual follow-up.', 'REQUESTED', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 1.00, current_timestamp - interval '5 hour'),
    ('f3333333-3333-3333-3333-333333333336', '88888888-8888-8888-8888-888888888884', '66666666-6666-6666-6666-666666666664', 'PHARMACY', 'Amlodipine refill', 'Dispense 30 tablets for one-month follow-up.', 'COMPLETED', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555556', 'dddddddd-dddd-dddd-dddd-ddddddddddd5', 30.00, current_timestamp - interval '2 day');

insert into discharge_plan (id, encounter_id, discharge_status, disposition, summary_notes, medication_notes, follow_up_date, discharged_by_user_id, updated_at)
values
    ('f5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888881', 'PLANNED', 'HOME_CARE', 'Prepare discharge once lab result is stable and dressing is completed.', 'Continue prescribed antibiotics and daily dressing care.', current_date + interval '5 day', '55555555-5555-5555-5555-555555555551', current_timestamp - interval '19 hour'),
    ('f5555555-5555-5555-5555-555555555556', '88888888-8888-8888-8888-888888888884', 'COMPLETED', 'HOME_CARE', 'Patient stable for discharge after blood pressure review and medication reconciliation.', 'Continue amlodipine once daily and keep home BP log.', current_date + interval '30 day', '55555555-5555-5555-5555-555555555551', current_timestamp - interval '2 day');

insert into broadcast_message (id, audience_scope, title, body, published_by, published_at)
values
    ('dededede-dede-dede-dede-dededededed1', 'ALL_USERS', 'Care continuity reminder', 'All departments should close or progress encounters before end-of-day reconciliation.', '55555555-5555-5555-5555-555555555552', current_timestamp - interval '6 hour');
