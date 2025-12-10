import os
import pandas as pd
import uuid
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# --- CONFIGURATION ---
load_dotenv()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FILES = {
    "students": os.path.join(BASE_DIR, 'ssc league v1 - students.csv'),
    "attendance": os.path.join(BASE_DIR, 'ssc league v1 - Attendance.csv'),
    "xp": os.path.join(BASE_DIR, 'ssc league v1 - xp_tracking.csv'),
    "ranking": os.path.join(BASE_DIR, 'ssc league v1 - Ranking.csv'),
    "weeks": os.path.join(BASE_DIR, 'ssc league v1 - Weeks.csv'),
}

SUPABASE_URL = "https://ribbrxwtzvrijaijryab.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpYmJyeHd0enZyaWphaWpyeWFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU3MzQ5MCwiZXhwIjoyMDc5MTQ5NDkwfQ.H3HpamDaxShBWeIq14J7RjMNuQk7T9KObKs01IREymg"

if not SUPABASE_KEY:
    raise ValueError("Missing SUPABASE_SERVICE_ROLE_KEY in .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- HELPER FUNCTIONS ---

def generate_deterministic_uuid(namespace_str):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, str(namespace_str)))

def safe_int(val):
    try:
        if pd.isna(val) or str(val).strip() == '': return 0
        return int(float(val))
    except:
        return 0

def get_week_from_date(date_str, weeks_df):
    try:
        # FIX 1: Handle Timezones by converting to naive datetime
        dt = pd.to_datetime(date_str, errors='coerce')
        if dt.tzinfo is not None:
            dt = dt.tz_localize(None)
            
        if pd.isna(dt): return 0
        
        weeks_df = weeks_df.sort_values('From')
        for _, row in weeks_df.iterrows():
            start = pd.to_datetime(row['From'], errors='coerce')
            end = pd.to_datetime(row['To'], errors='coerce')
            
            # Ensure comparison dates are also naive
            if start <= dt <= end:
                return safe_int(row['WeekNum'])
    except:
        pass
    return 0 

def calculate_streak(student_row, date_cols):
    streak = 0
    sorted_dates = sorted(date_cols, reverse=True)
    for date_col in sorted_dates:
        status = str(student_row[date_col]).strip().upper()
        if status == 'NAN' or status == '': continue
        if status == 'P' or status == 'T': streak += 1
        elif status in ['A', 'E']: break
    return streak

# --- MAIN SYNC LOGIC ---

def sync_all():
    print(f"📂 Reading CSV files...")
    
    try:
        weeks_df = pd.read_csv(FILES["weeks"])
        xp_df = pd.read_csv(FILES["xp"])
        att_df = pd.read_csv(FILES["attendance"])
        students_df = pd.read_csv(FILES["students"])
        ranking_df = pd.read_csv(FILES["ranking"])
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        return

    # 1. FETCH EXISTING IDS
    print("🕵️  Fetching existing IDs...")
    existing_students = {} 
    try:
        res = supabase.table("Student").select("id, student_id").execute()
        for record in res.data:
            if record['student_id']:
                existing_students[str(record['student_id'])] = record['id']
    except Exception as e:
        print(f"⚠️ Warning: Could not fetch existing students. {e}")

    # 2. FETCH QUIZ DATA FROM DB
    print("🧠 Fetching Quiz Results...")
    quiz_scores = {} 
    
    try:
        res = supabase.table("StudentAnswer").select("student_id, is_correct, question_id, attempted_at").execute()
        for ans in res.data:
            s_uuid = ans['student_id']
            week_num = get_week_from_date(ans['attempted_at'], weeks_df)
            points = 2 if ans['is_correct'] else 1
            
            if s_uuid not in quiz_scores: quiz_scores[s_uuid] = []
            
            quiz_scores[s_uuid].append({
                'week': week_num,
                'points': points,
                'q_id': ans['question_id'] 
            })
        print(f"✅ Loaded quiz data for {len(quiz_scores)} students.")
    except Exception as e:
        print(f"⚠️ Error fetching quiz data: {e}")


    # --- 3. CALCULATE HISTORICAL RANKS ---
    print("⏳ Calculating Time-Travel Ranks...")
    
    max_week = int(weeks_df['WeekNum'].max())
    history_records = []
    csv_xp_per_week = {}
    
    for _, row in xp_df.iterrows():
        sid = str(row['Student ID'])
        week = safe_int(row['Week'])
        amount = safe_int(row['FXP']) if 'FXP' in row and pd.notna(row['FXP']) and str(row['FXP']).strip() != '' else safe_int(row['XP'])
        
        if sid not in csv_xp_per_week: csv_xp_per_week[sid] = {}
        csv_xp_per_week[sid][week] = csv_xp_per_week[sid].get(week, 0) + amount

    for w in range(1, max_week + 2): 
        weekly_standings = []
        for _, row in students_df.iterrows():
            sid_str = str(row['ID'])
            if sid_str == 'nan' or sid_str not in existing_students: continue
            
            s_uuid = existing_students[sid_str]
            
            cumulative_csv_xp = 0
            for i in range(1, w + 1):
                cumulative_csv_xp += csv_xp_per_week.get(sid_str, {}).get(i, 0)
                
            cumulative_quiz_xp = 0
            if s_uuid in quiz_scores:
                for q in quiz_scores[s_uuid]:
                    # FIX 2: Only count quizzes if week is Valid (>0) and in the past/present
                    if q['week'] > 0 and q['week'] <= w:
                        cumulative_quiz_xp += q['points']
            
            total_xp_at_week = cumulative_csv_xp + cumulative_quiz_xp
            
            weekly_standings.append({
                'uuid': s_uuid,
                'sid_str': sid_str,
                'total_xp': total_xp_at_week
            })
            
        weekly_standings.sort(key=lambda x: x['total_xp'], reverse=True)
        
        for rank, student in enumerate(weekly_standings, 1):
            if student['total_xp'] >= 0: 
                history_records.append({
                    "id": generate_deterministic_uuid(f"hist_{student['sid_str']}_w{w}"),
                    "student_id": student['uuid'],
                    "week_number": w,
                    "rank": rank,
                    "total_xp": student['total_xp']
                })

    batch_size = 100
    for i in range(0, len(history_records), batch_size):
        batch = history_records[i:i + batch_size]
        try:
            supabase.table("WeeklyRankHistory").upsert(batch, on_conflict="student_id, week_number").execute()
        except Exception as e:
            print(f"⚠️ Error uploading history batch {i}: {e}")
            
    print(f"✅ Generated {len(history_records)} historical snapshots.")


    # --- 4. SYNC ATTENDANCE & STREAKS ---
    print("🔄 Syncing Attendance & Current Stats...")
    
    calculated_streaks = {} 
    date_cols = [c for c in att_df.columns if str(c).strip().startswith('2025')]
    for _, row in att_df.iterrows():
        sid = str(row['Student ID'])
        if sid in existing_students:
            calculated_streaks[sid] = calculate_streak(row, date_cols)

    stats_updates = []
    
    for _, row in ranking_df.iterrows():
        sid = str(row['ID'])
        if sid == 'nan' or sid not in existing_students: continue 
        
        s_uuid = existing_students[sid]
        
        name = row.get('Name', row.get('name', 'Unknown Agent'))
        group = str(row.get('group', row.get('Group', 'G1')))
        
        csv_total = sum(csv_xp_per_week.get(sid, {}).values())
        
        quiz_total = 0
        if s_uuid in quiz_scores:
            quiz_total = sum(q['points'] for q in quiz_scores[s_uuid])
            
        final_total = csv_total + quiz_total
        streak = calculated_streaks.get(sid, 0)
        
        stats_updates.append({
            "id": s_uuid,
            "student_id": sid,
            "full_name": name,
            "group_id": group, 
            "current_xp": final_total,
            "current_streak": streak,
            "updatedAt": datetime.now().isoformat()
        })
        
    supabase.table("Student").upsert(stats_updates).execute()
    print("✅ Stats Synced.")

    # --- 5. SYNC ATTENDANCE RECORDS ---
    att_records = []
    valid_id_vars = [c for c in ['Student ID', 'Name', 'Group'] if c in att_df.columns]
    melted = att_df.melt(id_vars=valid_id_vars, value_vars=date_cols, var_name='Date', value_name='Status')
    
    for _, row in melted.iterrows():
        status_code = str(row['Status']).strip().upper()
        sid = str(row['Student ID'])
        if not status_code or status_code not in ['P', 'T', 'A', 'E']: continue
        if sid not in existing_students: continue 

        date_str = str(row['Date']).split(' ')[0]
        status_map = {'P': 'PRESENT', 'T': 'TARDY', 'A': 'ABSENT', 'E': 'EXCUSED'}
        
        att_records.append({
            "id": generate_deterministic_uuid(f"att_{sid}_{date_str}"), 
            "student_id": existing_students[sid],
            "date": date_str,
            "status": status_map[status_code],
            "week_number": get_week_from_date(date_str, weeks_df)
        })

    for i in range(0, len(att_records), 100):
        supabase.table("AttendanceRecord").upsert(att_records[i:i+100], on_conflict="student_id, date").execute()
    print(f"✅ Synced {len(att_records)} attendance records.")

if __name__ == "__main__":
    sync_all()
    print("🚀 FULL SYNC COMPLETE.")