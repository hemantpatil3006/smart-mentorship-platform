-- Run this in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('mentor', 'student')) NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read profiles (needed for searching students)
CREATE POLICY "Anyone can view profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'role');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

----------------------------------------------------
-- SESSIONS
----------------------------------------------------

-- Create sessions table
CREATE TABLE public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'completed')) DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow mentors to read their own sessions
CREATE POLICY "Mentors can view their sessions" 
ON public.sessions FOR SELECT 
USING (auth.uid() = mentor_id);

-- Allow students to read their own sessions
CREATE POLICY "Students can view their sessions" 
ON public.sessions FOR SELECT 
USING (auth.uid() = student_id);

-- Allow mentors to insert sessions
CREATE POLICY "Mentors can create sessions" 
ON public.sessions FOR INSERT 
WITH CHECK (auth.uid() = mentor_id);

-- Allow participants to update session status
CREATE POLICY "Participants can update session" 
ON public.sessions FOR UPDATE 
USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- Allow participants to view their sessions
CREATE POLICY "Participants can view their sessions" 
ON public.sessions FOR SELECT 
USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- --------------------------------------------------------------------------
-- 4. Messages Table for Real-Time Chat
-- --------------------------------------------------------------------------
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  sender_email text NOT NULL,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow session participants to insert messages
CREATE POLICY "Participants can insert messages" 
ON public.messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = messages.session_id 
    AND (sessions.mentor_id = auth.uid() OR sessions.student_id = auth.uid())
  )
);

-- Allow session participants to read messages
CREATE POLICY "Participants can view messages" 
ON public.messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.sessions 
    WHERE sessions.id = messages.session_id 
    AND (sessions.mentor_id = auth.uid() OR sessions.student_id = auth.uid())
  )
);

