# Berry Blossom Medical Centre v14

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

For an existing v13 Supabase project, run `backend/supabase/migration-v14.sql`.
