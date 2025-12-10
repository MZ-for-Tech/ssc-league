// scripts/sync-emails.js
require('dotenv').config({ path: '.env.local' }); // Make sure you have dotenv installed: npm i dotenv
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use the secret key

if (!SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncEmails() {
  console.log("🔄 Starting Email Sync...");

  // 1. Fetch all students
  // We select the Real Email (from DB) and the Auth ID (to link them)
  const { data: students, error } = await supabase
    .from('Student')
    .select('id, student_id, email, auth_id')
    .not('auth_id', 'is', null);

  if (error) return console.error("Error fetching students:", error);

  console.log(`Found ${students.length} students to update.`);

  let count = 0;
  for (const student of students) {
    if (!student.email || !student.email.includes('@')) {
      console.log(`⚠️ Skipping ${student.student_id}: Invalid real email.`);
      continue;
    }

    // 2. Force Update the Auth User
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      student.auth_id,
      { 
        email: student.email,
        email_confirm: true // Auto-verify so they don't get locked out
      }
    );

    if (updateError) {
      console.error(`❌ Failed to update ${student.student_id}:`, updateError.message);
    } else {
      console.log(`✅ Updated: ${student.student_id} -> ${student.email}`);
      count++;
    }
  }

  console.log(`🎉 Sync Complete! Updated ${count} users.`);
}

syncEmails();
