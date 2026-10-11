# Berry Blossom: private office activation setup

**Do not put personal activation codes in GitHub, Codespaces commits, or app settings.**

1. Apply `migration-v17.sql` to your live Supabase project after the existing schema.
2. Create two ordinary accounts through the app, and complete activation of their staff accounts. Decide which exact **username** will be Hospital Owner and which will be Hospital Director. Usernames are matched case-insensitively.
3. In the Supabase SQL Editor **only**, execute the SQL below after replacing the placeholders with actual usernames and independently chosen, random 16–32 character codes. Keep the two codes private and separate. Do not copy the edited SQL back into any repository.

```sql
insert into public.executive_invites(username,office_role,code_hash)
values (
  lower('OWNER_USERNAME'), 'owner',
  crypt('OWNER_PRIVATE_RANDOM_16_PLUS_CHARACTER_CODE', gen_salt('bf',12))
);

insert into public.executive_invites(username,office_role,code_hash)
values (
  lower('DIRECTOR_USERNAME'), 'director',
  crypt('DIRECTOR_PRIVATE_RANDOM_16_PLUS_CHARACTER_CODE', gen_salt('bf',12))
);
```

4. Each executive signs in with their own usual username and password, opens Home → Level 3 → Directors’ Office, then enters **only their own one-time code**. After successful activation, the code field is cleared and all subsequent logins use normal credentials without the code.
5. Access controls are checked in the live database. Failed attempts have a 30-minute cooldown after five failures. Admin privileges by themselves do **not** grant entry to the Directors’ Office. Live security officers can be assigned using the Security Office control by an admin.

**Demo mode:** The `berrytester` account can inspect other cosmetic previews and map staff boards. The Directors’ Office deliberately remains unavailable because local browser storage cannot securely verify a private activation code.

If an executive account is deleted, the claim remains marked activated; to reissue you must carefully review/reset it through the Supabase SQL Editor. Never just publish another code in the client.
