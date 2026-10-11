# Berry Blossom Medical Centre v15

This rebuild deliberately removes the bottom navigation and scrolling sub-tab bars.

## Navigation
- Top-left hamburger menu for all main app sections
- Top-right profile button
- Top-right settings button
- Home is a welcome/launch page only

## Themes
- Standard Berry Blossom: 1080×1920 portrait wallpaper
- Halloween: 1080×1920 portrait wallpaper
- Christmas: 1080×1920 portrait wallpaper
- Canvas particles: strawberries, autumn leaves, snowflakes

## Profiles
- Rounded-square avatars
- 12 departments × male / female / medical mascot = 36 separate avatar files
- Six selectable profile banner backgrounds
- Full staff profile popups
- Profile bio and status message
- Existing frames, rewards and badges retained

## Data
The included data engine supports:
- demo/local mode immediately
- Supabase Auth/Postgres/Realtime when configured
- secure quiz worker
- Roblox presence worker

For an existing v13 Supabase project, run `backend/supabase/migration-v15.sql`.


## v15 art upgrade
108 department avatars, 36 gold HOD avatars, transparent frames, 1080x1920 themes, individual high-quality icons, and randomized multi-sprite particle physics.


## v16 profile + cosmetics testing fixes
- Five 2172×724 3:1 banners: standard, Halloween, Christmas, executive gold and clinical blue. Older banners still available.
- Correctly sized and fully visible responsive cover artwork. Profile name/photo sits underneath the banner to avoid cropping.
- Live profile-frame selector. Transparent overlays work in staff popups, directory, and own profile.
- All nine standard avatar variants per department; 3 gold HoD portraits for managers/admin.
- Admin-only Cosmetics Lab for previewing 144 profile pictures, 6 frames, 11 banners, badges, icons and theme art without altering live data.
- Demo-only seeded account `berrytester` / `preview123` for testing. It has local demo privileges only; it cannot log into Supabase.
- The existing v14 Supabase profile customization migration must be applied to save banners and bios in live mode.

For deployment the entry point is `index.html` at repository root. ZIP files should be extracted **into repo root**, not into a nested `app` folder (the GitHub branch is named `App`).

## v17 Hospital map and staff boards
- Home now displays an interactive conceptual hospital floor directory (B1, G, Level 1, Level 2 and Level 3). Floor arrows, direct level selectors and scroll/swipe navigation are supported.
- Each of the 12 departments has a clickable map location opening its own live, brass-framed hospital staff nameplate board. A dedicated Staff Board page lists on-duty staff department by department.
- Staff boards use **live `staff_status.on_shift`**, rather than showing a scheduled person as present. The nameplate prefixes a professional title according to the staff member's recorded role (Doctor → Dr, Nurse, Midwife, Paramedic, etc.).
- The home map uses existing festive background art with the existing theme particle physics rendered over it and behind the interactive map. The sticky Berry Blossom title is exclusive to the map home screen. On other screens, the top bar shows that screen's title.
- Security Office: authorised live administrators and security staff only. Administrators can assign/revoke security membership.
- Directors’ Office: only a separately verified live Owner or Director account. Each user signs up normally with their chosen username, then privately enters a one-time activation code. After activation only the display name/office title are shown. **Codes must never be put in public GitHub files or client-side scripts**.
- **Mandatory Supabase setup for restricted offices**: run `backend/supabase/migration-v17.sql` in your live project's SQL Editor. Configure the two invite usernames and securely-generated private codes in the SQL Editor as explained at the end of that file. The live database stores only bcrypt hashes. No owner/director code ships with this ZIP. The local demo does not pretend to offer secure executive access.
- This is a **conceptual roleplay map**, not a verified copy of Maple Hospital's in-game floor geometry. Provide the actual Roblox floor plan if you want the map to match precisely.
- Existing v16 profile customization and all previously supplied themes/assets remain in place.

**Installation:** from the repository root on branch `App`, extract the ZIP into `.` (not an inner `app/` folder), stage changes and push. See supplied instructions. Applying the SQL migration is separate from the static GitHub Pages update.
