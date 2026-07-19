Quick testing guide — Supabase Storage + RLS

1) Prepare env
- Copy `.env.local.example` to `.env.local` in the `contractiq` folder and fill values from your Supabase project.

2) Create a test user (if you don't have one)
- Dashboard: Supabase → Authentication → Users → Add user (email + password)
- Note the user's UID shown in the Users list and set `TEST_USER_UID` in `.env.local` or use the client to sign in.

3) Upload a test PDF to the contracts bucket
- Dashboard: Storage → Files → contracts → Create folder → name it exactly as the user's UID
- Upload a small PDF into that folder (e.g. `test.pdf`). The object key will be `<UID>/test.pdf`.

4) Create a contract row (optional)
- In SQL editor or via Admin, insert a row linking the file_path:

  INSERT INTO public.contracts (user_id, name, contract_type, status, file_path)
  VALUES ('<UID>', 'Manual Test', 'NDA', 'ready', '<UID>/test.pdf');

5) Test from a signed-in browser console (recommended)
- Start your app (`npm run dev`) and sign in as the test user.
- Open the browser console on a page where `supabase` client is available (or paste the code below after replacing the `createClient` args).

Browser console snippet (paste and run):

(async () => {
  const SUPABASE_URL = window.location.origin.includes('localhost') ? "" : window.SUPABASE_URL; // if your app exposes it
  // If your app exposes `supabase` or `createClient`, use that. Otherwise, create a client:
  const { createClient } = supabaseJs || window.supabaseJs || window.supabase || {};
  // If you can't create a client in console, run these commands in your app code instead.

  // Get current signed-in user
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  console.log('user', userRes, userErr);
  const uid = userRes?.user?.id;
  if (!uid) return console.error('Not signed in as test user');

  // List files
  const { data: list, error: listErr } = await supabase.storage.from('contracts').list(`${uid}/`);
  console.log('list', list, listErr);

  // Create signed URL
  const { data: signed, error: signedErr } = await supabase.storage.from('contracts').createSignedUrl(`${uid}/test.pdf`, 60);
  console.log('signedUrl', signed, signedErr);

  // Try download (opens in new tab)
  const { data: blob, error: dlErr } = await supabase.storage.from('contracts').download(`${uid}/test.pdf`);
  if (!dlErr && blob) {
    const url = URL.createObjectURL(blob);
    window.open(url);
  } else console.error(dlErr);
})();

6) Negative test
- Sign in as a different user or open an incognito window and try the `list` call — it should return empty or an error.

7) If anything fails
- Copy the exact console error and the object key shown in the Storage UI and paste here; I'll diagnose.

Notes
- I cannot run Supabase dashboard actions from here. These files provide scripts and instructions so you can run the tests locally fast. Once you run them and paste any errors, I'll finish the rest (INSERT/DELETE policies, DB verification).