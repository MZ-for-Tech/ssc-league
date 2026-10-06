import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';

dotenv.config({ path: '.env.local' });
dotenv.config();

// CONFIGURATION
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Helper to generate random password
const generatePassword = () => randomBytes(24).toString('base64url');

async function migrate() {
  console.log("🚀 Starting Migration...");

  // 1. Fetch all students who don't have an auth_id yet
  const { data: students, error } = await supabase
    .from('Student')
    .select('*')
    .is('auth_id', null);

  if (error) return console.error("Error fetching students:", error);
  console.log(`Found ${students.length} students to migrate.`);

  const credentials = [];

  for (const student of students) {
    const fakeEmail = `${student.student_id}@league.app`;
    const password = generatePassword();

    // 2. Create Auth User
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: fakeEmail,
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.error(`Failed to create user for ${student.student_id}:`, authError.message);
      continue;
    }

    // 3. Link Auth ID to Student Table
    const { error: updateError } = await supabase
      .from('Student')
      .update({ auth_id: authUser.user.id })
      .eq('id', student.id);

    if (updateError) {
      console.error(`Failed to link ID for ${student.student_id}:`, updateError.message);
    } else {
      console.log(`✅ Migrated: ${student.full_name} (${student.student_id})`);
      credentials.push(`${student.student_id},${password},${student.full_name}`);
    }
  }

  // 4. Save CSV
  fs.writeFileSync('student_credentials.csv', 'Student ID,Password,Name\n' + credentials.join('\n'));
  console.log("🎉 Migration Complete! Credentials saved to 'student_credentials.csv'");
}

migrate();
