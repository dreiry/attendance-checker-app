-- Profiles table to store user roles and basic info
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('teacher', 'student')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes created by teachers
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL, -- Short code for students to join
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student enrollments in classes
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

-- Daily attendance sessions (the "QR code" for the day)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  session_date DATE DEFAULT CURRENT_DATE NOT NULL,
  qr_token TEXT NOT NULL, -- A dynamic token to prevent static image cheating
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Actual attendance records
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  device_info TEXT, -- Basic fingerprinting
  UNIQUE(session_id, student_id)
);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see their own profile, teachers can see their students
CREATE POLICY "Public profiles are viewable by self" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Classes: Teachers can manage their own classes, students can see classes they are in
CREATE POLICY "Teachers can manage their own classes" ON public.classes 
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'teacher' AND id = teacher_id));

CREATE POLICY "Students can view enrolled classes" ON public.classes
  USING (auth.uid() IN (SELECT student_id FROM public.enrollments WHERE class_id = id));

-- Enrollments: Students can join, teachers can see students in their classes
CREATE POLICY "Students can enroll themselves" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view relevant enrollments" ON public.enrollments FOR SELECT 
  USING (auth.uid() = student_id OR auth.uid() IN (SELECT teacher_id FROM public.classes WHERE id = class_id));

-- Attendance: Sessions managed by teachers, logs created by students
CREATE POLICY "Teachers manage sessions" ON public.attendance_sessions USING (auth.uid() IN (SELECT teacher_id FROM public.classes WHERE id = class_id));
CREATE POLICY "Students view sessions" ON public.attendance_sessions FOR SELECT USING (auth.uid() IN (SELECT student_id FROM public.enrollments WHERE class_id = attendance_sessions.class_id));

CREATE POLICY "Students log attendance" ON public.attendance_logs FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users view relevant logs" ON public.attendance_logs FOR SELECT 
  USING (auth.uid() = student_id OR auth.uid() IN (SELECT teacher_id FROM public.classes WHERE id = (SELECT class_id FROM public.attendance_sessions WHERE id = session_id)));
