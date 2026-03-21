import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { supabase, getSupabaseClient } from '../lib/supabase';

const router = Router();

// GET /api/sessions/active - Get all active/pending sessions for the user
router.get('/active', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    const userClient = getSupabaseClient(token);

    // Fetch sessions where user is either mentor or student
    const { data: sessions, error } = await userClient
      .from('sessions')
      .select(`
        *,
        mentor:profiles!mentor_id(email, role),
        student:profiles!student_id(email, role)
      `)
      .in('status', ['pending', 'active'])
      .or(`mentor_id.eq.${userId},student_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions/create - Create a new session (mentor only)
router.post('/create', requireAuth, async (req: AuthRequest, res) => {
  try {
    const mentorId = req.user.id;
    const { student_email } = req.body;
    
    if (!student_email) {
      return res.status(400).json({ error: 'student_email is required' });
    }

    const searchEmail = student_email.trim().toLowerCase();
    const token = req.headers.authorization?.split(' ')[1] || '';
    const userClient = getSupabaseClient(token);

    // Step 1: Find student by email
    const { data: student, error: studentError } = await userClient
      .from('profiles')
      .select('id, role')
      .eq('email', searchEmail)
      .single();
      
    if (studentError || !student) {
      return res.status(404).json({ error: 'Student not found with that email' });
    }
    if (student.role !== 'student') {
      return res.status(400).json({ error: 'This user is a mentor, not a student. You must invite a student.' });
    }

    // Step 2: Validate the caller is a mentor
    const { data: mentorProfile } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', mentorId)
      .single();

    if (mentorProfile?.role !== 'mentor') {
      return res.status(403).json({ error: 'Only mentors can create sessions' });
    }

    // Step 3: Create the session
    const { data: session, error: sessionError } = await userClient
      .from('sessions')
      .insert({
        mentor_id: mentorId,
        student_id: student.id,
        status: 'pending'
      })
      .select()
      .single();
      
    if (sessionError) {
      return res.status(400).json({ error: sessionError.message });
    }

    res.status(201).json({ session });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions/join - Join a session (assigned student only)
router.post('/join', requireAuth, async (req: AuthRequest, res) => {
  try {
    const studentId = req.user.id;
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const token = req.headers.authorization?.split(' ')[1] || '';
    const userClient = getSupabaseClient(token);

    // Verify the session belongs to this student and is pending
    const { data: session, error: fetchError } = await userClient
      .from('sessions')
      .select('*')
      .eq('id', session_id)
      .eq('student_id', studentId)
      .single();
      
    if (fetchError || !session) {
      return res.status(404).json({ error: 'Session not found or you are not authorized to join it' });
    }

    if (session.status !== 'pending' && session.status !== 'active') {
      return res.status(400).json({ error: `Session is already ${session.status}` });
    }

    // Update status to active
    const { data: updatedSession, error: updateError } = await userClient
      .from('sessions')
      .update({ status: 'active' })
      .eq('id', session_id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ session: updatedSession });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions/end - End a session
router.post('/end', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.id;
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const token = req.headers.authorization?.split(' ')[1] || '';
    const userClient = getSupabaseClient(token);

    // Update status to completed if the user is mentor or student (RLS handles auth check)
    const { data: updatedSession, error: updateError } = await userClient
      .from('sessions')
      .update({ status: 'completed' })
      .eq('id', session_id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    res.json({ session: updatedSession, message: 'Session ended successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
