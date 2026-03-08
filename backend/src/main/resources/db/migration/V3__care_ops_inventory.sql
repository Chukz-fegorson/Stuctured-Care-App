create table inventory_item (
    id uuid primary key,
    organization_id uuid not null references organization (id),
    sku varchar(60) not null unique,
    item_name varchar(150) not null,
    item_category varchar(60) not null,
    unit_of_measure varchar(30) not null,
    quantity_on_hand numeric(14, 2) not null,
    reorder_level numeric(14, 2) not null,
    inventory_status varchar(30) not null,
    updated_at timestamp not null default current_timestamp
);

create table inventory_movement (
    id uuid primary key,
    inventory_item_id uuid not null references inventory_item (id),
    movement_type varchar(30) not null,
    quantity numeric(14, 2) not null,
    reference_entity_type varchar(40),
    reference_entity_id uuid,
    notes text,
    moved_by_user_id uuid references user_account (id),
    moved_at timestamp not null default current_timestamp
);

create table triage_assessment (
    id uuid primary key,
    encounter_id uuid not null unique references encounter (id),
    recorded_by_user_id uuid references user_account (id),
    acuity_level varchar(20) not null,
    chief_complaint varchar(250) not null,
    temperature_c numeric(4, 1),
    systolic_bp integer,
    diastolic_bp integer,
    heart_rate integer,
    respiratory_rate integer,
    oxygen_saturation integer,
    weight_kg numeric(5, 2),
    notes text,
    recorded_at timestamp not null default current_timestamp
);

create table consultation_note (
    id uuid primary key,
    encounter_id uuid not null unique references encounter (id),
    clinician_user_id uuid references user_account (id),
    diagnosis varchar(250) not null,
    clinical_notes text not null,
    care_plan text,
    follow_up_instruction text,
    recorded_at timestamp not null default current_timestamp
);

create table department_task (
    id uuid primary key,
    encounter_id uuid not null references encounter (id),
    patient_id uuid not null references patient_profile (id),
    department_type varchar(40) not null,
    task_title varchar(150) not null,
    task_details text,
    task_status varchar(30) not null,
    requested_by_user_id uuid references user_account (id),
    assigned_to_user_id uuid references user_account (id),
    inventory_item_id uuid references inventory_item (id),
    quantity_requested numeric(12, 2),
    updated_at timestamp not null default current_timestamp
);

create table discharge_plan (
    id uuid primary key,
    encounter_id uuid not null unique references encounter (id),
    discharge_status varchar(30) not null,
    disposition varchar(60) not null,
    summary_notes text not null,
    medication_notes text,
    follow_up_date date,
    discharged_by_user_id uuid references user_account (id),
    updated_at timestamp not null default current_timestamp
);

insert into department (id, organization_id, code, name, department_type)
values
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'LAB', 'Laboratory', 'DIAGNOSTIC'),
    ('44444444-4444-4444-4444-444444444445', '22222222-2222-2222-2222-222222222222', 'PHARM', 'Pharmacy', 'CLINICAL');

insert into user_account (id, organization_id, department_id, platform_role, email, full_name, status)
values
    ('55555555-5555-5555-5555-555555555554', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444441', 'NURSE', 'nurse@structurehealth.local', 'Nneka Eze', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'LAB_SCIENTIST', 'lab@structurehealth.local', 'Samuel Ade', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555556', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444445', 'PHARMACIST', 'pharmacy@structurehealth.local', 'Chioma Ndukwe', 'ACTIVE');

insert into inventory_item (id, organization_id, sku, item_name, item_category, unit_of_measure, quantity_on_hand, reorder_level, inventory_status)
values
    ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '22222222-2222-2222-2222-222222222222', 'MED-CEF-1G', 'Ceftriaxone 1g', 'MEDICATION', 'VIAL', 42.00, 20.00, 'AVAILABLE'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '22222222-2222-2222-2222-222222222222', 'CONS-DRESS', 'Sterile dressing pack', 'CONSUMABLE', 'PACK', 18.00, 12.00, 'LOW_STOCK'),
    ('dddddddd-dddd-dddd-dddd-ddddddddddd3', '22222222-2222-2222-2222-222222222222', 'LAB-CBC', 'CBC reagent kit', 'LAB_SUPPLY', 'KIT', 9.00, 6.00, 'LOW_STOCK');

insert into inventory_movement (id, inventory_item_id, movement_type, quantity, reference_entity_type, reference_entity_id, notes, moved_by_user_id)
values
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'RESTOCK', 50.00, 'INVENTORY_ITEM', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 'Opening stock load', '55555555-5555-5555-5555-555555555556'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'dddddddd-dddd-dddd-dddd-ddddddddddd2', 'ISSUE', 4.00, 'ENCOUNTER', '88888888-8888-8888-8888-888888888881', 'Used for dressing review follow-up', '55555555-5555-5555-5555-555555555556');

insert into triage_assessment (id, encounter_id, recorded_by_user_id, acuity_level, chief_complaint, temperature_c, systolic_bp, diastolic_bp, heart_rate, respiratory_rate, oxygen_saturation, weight_kg, notes)
values
    ('f1111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555554', 'MODERATE', 'Post-operative wound review and pain check', 37.4, 126, 82, 88, 18, 98, 64.50, 'Patient walked in comfortably and reports mild dressing discomfort.');

insert into consultation_note (id, encounter_id, clinician_user_id, diagnosis, clinical_notes, care_plan, follow_up_instruction)
values
    ('f2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888881', '55555555-5555-5555-5555-555555555551', 'Healing post-operative wound with mild inflammation', 'Wound edges are clean. No purulent discharge. Mild pain on dressing change.', 'Continue ceftriaxone, repeat dressing change, order CBC, and monitor for fever.', 'Return in 5 days or earlier if fever, swelling, or discharge increases.');

insert into department_task (id, encounter_id, patient_id, department_type, task_title, task_details, task_status, requested_by_user_id, assigned_to_user_id, inventory_item_id, quantity_requested)
values
    ('f3333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', 'LAB', 'Complete blood count', 'CBC requested to rule out infection progression.', 'REQUESTED', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 1.00),
    ('f4444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888881', '66666666-6666-6666-6666-666666666661', 'PHARMACY', 'Ceftriaxone 1g refill', 'Dispense three doses for wound management continuation.', 'IN_PROGRESS', '55555555-5555-5555-5555-555555555551', '55555555-5555-5555-5555-555555555556', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 3.00);

insert into discharge_plan (id, encounter_id, discharge_status, disposition, summary_notes, medication_notes, follow_up_date, discharged_by_user_id)
values
    ('f5555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888881', 'PLANNED', 'HOME_CARE', 'Prepare discharge once lab result is stable and dressing is completed.', 'Continue prescribed antibiotics and daily dressing care.', current_date + interval '5 day', '55555555-5555-5555-5555-555555555551');
