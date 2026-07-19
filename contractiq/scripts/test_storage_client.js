// Browser console helper for testing Supabase Storage
// Paste this into the browser console on a page where your app's Supabase client is available

(async () => {
  if (typeof supabase === 'undefined') {
    console.warn('`supabase` client not found on window. If your app exposes createClient use that, otherwise run this from your app code.');
  }

  try {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes?.user?.id;
    console.log('signed in uid:', uid);
    if (!uid) return console.error('Not signed in as test user');

    const { data: list, error: listErr } = await supabase.storage.from('contracts').list(`${uid}/`);
    console.log('list', list, listErr);

    const { data: signed, error: signedErr } = await supabase.storage.from('contracts').createSignedUrl(`${uid}/test.pdf`, 60);
    console.log('signedUrl', signed, signedErr);

    const { data: blob, error: dlErr } = await supabase.storage.from('contracts').download(`${uid}/test.pdf`);
    if (!dlErr && blob) {
      const url = URL.createObjectURL(blob);
      console.log('opening', url);
      window.open(url);
    } else console.error('download error', dlErr);
  } catch (e) {
    console.error(e);
  }
})();
