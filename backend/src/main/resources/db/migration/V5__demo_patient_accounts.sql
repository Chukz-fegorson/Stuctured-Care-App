insert into user_account (id, organization_id, department_id, platform_role, email, full_name, status)
values
    ('55555555-5555-5555-5555-555555555557', '22222222-2222-2222-2222-222222222222', null, 'PATIENT', 'emeka@structurehealth.local', 'Emeka Okonkwo', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555558', '22222222-2222-2222-2222-222222222222', null, 'PATIENT', 'fatima@structurehealth.local', 'Fatima Bello', 'ACTIVE'),
    ('55555555-5555-5555-5555-555555555559', '22222222-2222-2222-2222-222222222222', null, 'PATIENT', 'tunde@structurehealth.local', 'Tunde Adeyemi', 'ACTIVE')
on conflict do nothing;

update patient_profile
set user_account_id = '55555555-5555-5555-5555-555555555557'
where id = '66666666-6666-6666-6666-666666666662';

update patient_profile
set user_account_id = '55555555-5555-5555-5555-555555555558'
where id = '66666666-6666-6666-6666-666666666663';

update patient_profile
set user_account_id = '55555555-5555-5555-5555-555555555559'
where id = '66666666-6666-6666-6666-666666666664';
