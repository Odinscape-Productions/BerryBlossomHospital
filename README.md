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
