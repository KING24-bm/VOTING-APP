# Super Admin Implementation TODO

## Step 1: Database Migration ✅
- Migration file created: supabase/migrations/20260212150000_add_superadmin_fields.sql
- [TODO] User: Run this in your Supabase Dashboard > SQL Editor
- Verify: SELECT username, is_super_admin FROM teachers WHERE username = 'SuperAdmin123';

## Step 2: Create Teacher Types ✅
- Created src/types/teacher.ts with Teacher interface (is_super_admin, is_approved, etc.)

## Step 3: Update AuthContext.tsx ✅
- Rewritten: teacher: Teacher | null state, login checks is_approved, signup is_approved=false (pending), JSON localStorage, isSuperAdmin computed

## Step 4: Update TeacherSignup.tsx ✅
- Pending request message on success, no auto-login, "Submit Request" button

## Step 5: Update TeacherLogin.tsx ✅
- Conditional nav based on isSuperAdmin, approval error message, Teacher type import

## Step 6: Create SuperAdminDashboard.tsx ✅
- Created with 4 views: create, SuperViewPolls, results, teachers. Purple theme, teacher name welcome

## Step 7: Create ManageTeachers.tsx ✅
- Full table approve/decline pending, super badge, refresh/loading

## Step 8: Create SuperViewPolls.tsx ✅
- Edit modal, toggle, soft/hard delete, active/deleted sections, TS fix

## Step 9: Update App.tsx ✅
- Added /SuperAdminDashboard route + ProtectedSuperAdminRoute, enhanced teacher checks

## Step 7: Create ManageTeachers.tsx ✅
- Full table with approve/decline pending teachers, superadmin badge, refresh, loading states

## Step 8: Create SuperViewPolls.tsx ✅
- Full superadmin poll manager: edit modal, toggle, soft/hard delete, active/deleted sections

- On success: Show "Request submitted for approval" + Login link. No dashboard nav

## Step 5: Update TeacherLogin.tsx [TODO]
- On login success: if teacher.isSuperAdmin -> /SuperAdminDashboard else /TeacherDashboard

## Step 6: Create SuperAdminDashboard.tsx [TODO]
- New file src/components/SuperAdminDashboard.tsx
- Menu: Create Poll, View Polls, View Results, Manage Teachers
- Switch views like TeacherDashboard

## Step 7: Create ManageTeachers.tsx [TODO]
- New file src/components/ManageTeachers.tsx  
- Fetch all teachers, highlight pending (is_approved=false)
- Accept: UPDATE is_approved=true
- Decline: DELETE teacher
- List: username, email, school_name, status, actions

## Step 8: Enhance/Create SuperViewPolls.tsx [TODO]
- Copy ViewPolls.tsx or props-based
- Add Edit modal (title, description)
- Section for deleted polls (if add deleted_at)

## Step 9: Update App.tsx [TODO]
- Add route /SuperAdminDashboard
- New ProtectedSuperAdminRoute (check teacher?.isSuperAdmin)

## Step 10: Test [TODO]
- npm run dev
- Test superadmin login -> dashboard -> manage teachers
- Test normal signup -> pending -> superadmin approve
- Test poll edit/delete

**Next Action: Start with DB migration (Step 1)**
