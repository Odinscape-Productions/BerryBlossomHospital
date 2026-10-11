-- Run after schema.sql while logged into the SQL editor.
-- Create the first user through the app, then promote that user to admin once:
-- update public.profiles set role='admin',account_status='active',rank='Hospital Administrator',department='Administration',maple_role='Hospital Director',unit='Admin Offices' where username='YOUR_USERNAME';

insert into public.announcements(title,body) values
('Welcome to Berry Blossom','The new Berry Blossom companion app is live.'),
('Training Centre','Check Training for new department sessions and events.');

insert into public.shifts(title,department,starts_at,ends_at,capacity)
values('A&E Evening Shift','A&E',now()+interval '1 day',now()+interval '1 day 4 hours',5);

insert into public.trainings(title,department,starts_at,capacity,location)
values('Basic Life Support (BLS)','General',now()+interval '2 days',14,'A&E Training Room');
