# Cloudflare Workers

## Secure quiz worker
The quiz worker keeps correct answers out of GitHub Pages and writes the applicant's score directly to Supabase using the server-side service role secret. Applicants receive only `pending` or `declined`, never their hidden score while pending.

Create a KV namespace named `QUIZ_BANK`, load the keys shown in `quiz-bank-template.json`, then configure:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- encrypted secret `SUPABASE_SERVICE_ROLE_KEY`

Add a KV entry for every department used in the app. The template includes General and A&E examples. Department medical questions should remain roleplay-safe and avoid real medication doses or real-world certification claims.

## Roblox worker
The Roblox worker resolves public usernames and proxies Roblox Presence with short cache times. It never accepts Roblox passwords, cookies or session tokens.
