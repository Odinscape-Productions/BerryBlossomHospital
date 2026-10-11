# Supabase backend

The production app uses Supabase Auth, Postgres, RLS and Realtime.

1. Create a Supabase project.
2. In **Authentication > Providers > Email**, enable email/password and disable email confirmation. The app uses a private synthetic email internally so members still sign in with **username + password**.
3. Run `schema.sql` in the SQL editor.
4. Create your first account in the app, then run the single admin-promotion statement shown in `seed.sql` with your username.
5. Optionally run the rest of `seed.sql` for starter content.
6. Copy the project URL and **anon** key into the app's Backend Connection screen or `js/config.js`.
7. Never place the Supabase service-role key in the web app or GitHub Pages.

The SQL includes RLS, secure RPC functions, applicant score masking, realtime publication, shift clocking, training bookings, event RSVPs, global themes, staff status and operational RP tables.
