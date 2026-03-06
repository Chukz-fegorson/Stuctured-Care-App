create table organization (
    id uuid primary key,
    organization_type varchar(50) not null,
    code varchar(50) not null unique,
    name varchar(200) not null,
    parent_organization_id uuid references organization (id),
    created_at timestamp not null default current_timestamp
);

create table department (
    id uuid primary key,
    organization_id uuid not null references organization (id),
    code varchar(50) not null,
    name varchar(150) not null,
    department_type varchar(50) not null,
    created_at timestamp not null default current_timestamp,
    constraint uk_department_org_code unique (organization_id, code)
);

create table user_account (
    id uuid primary key,
    organization_id uuid not null references organization (id),
    department_id uuid references department (id),
    platform_role varchar(80) not null,
    email varchar(150) not null unique,
    full_name varchar(150) not null,
    status varchar(30) not null,
    created_at timestamp not null default current_timestamp
);

create table patient_profile (
    id uuid primary key,
    user_account_id uuid unique references user_account (id),
    global_patient_number varchar(80) not null unique,
    insurance_member_number varchar(80),
    gender varchar(20),
    date_of_birth date,
    phone_number varchar(40),
    created_at timestamp not null default current_timestamp
);

create table encounter (
    id uuid primary key,
    patient_id uuid not null references patient_profile (id),
    hospital_id uuid not null references organization (id),
    attending_user_id uuid references user_account (id),
    journey_stage varchar(40) not null,
    status varchar(30) not null,
    opened_at timestamp not null,
    closed_at timestamp
);

create table claim_case (
    id uuid primary key,
    encounter_id uuid not null unique references encounter (id),
    hospital_id uuid not null references organization (id),
    hmo_id uuid not null references organization (id),
    claim_status varchar(30) not null,
    total_amount numeric(14, 2) not null,
    approved_amount numeric(14, 2),
    submitted_at timestamp,
    settled_at timestamp
);

create table reconciliation_case (
    id uuid primary key,
    claim_case_id uuid not null unique references claim_case (id),
    patient_position varchar(30) not null,
    hospital_position varchar(30) not null,
    hmo_position varchar(30) not null,
    variance_amount numeric(14, 2) not null,
    reconciliation_status varchar(30) not null,
    updated_at timestamp not null default current_timestamp
);

create table broadcast_message (
    id uuid primary key,
    audience_scope varchar(80) not null,
    title varchar(150) not null,
    body text not null,
    published_by uuid references user_account (id),
    published_at timestamp not null default current_timestamp
);

create table audit_event (
    id uuid primary key,
    user_account_id uuid references user_account (id),
    entity_type varchar(80) not null,
    entity_id uuid,
    action varchar(80) not null,
    details text,
    occurred_at timestamp not null default current_timestamp
);

