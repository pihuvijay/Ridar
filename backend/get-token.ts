import { createClient } from "@supabase/supabase-js";
import "dotenv/config";



const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

async function main() {
  // put a real test user you created in Supabase Auth
  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  console.log("access_token:", data.session?.access_token);
  console.log("user_id:", data.user?.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});