create table encounter_documentation (
    id uuid primary key,
    encounter_id uuid not null unique references encounter (id),
    documented_by_user_id uuid references user_account (id),
    patient_history text,
    subjective_notes text not null,
    objective_findings text not null,
    assessment_notes text not null,
    care_plan_notes text not null,
    medication_plan text,
    safety_flags text,
    next_step_notes text,
    updated_at timestamp not null default current_timestamp
);
