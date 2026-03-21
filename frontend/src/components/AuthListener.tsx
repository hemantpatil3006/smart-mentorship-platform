'use client';
import { useEffect } from 'react';
import { supabase } from '@/utils/supabase/client';

export default function AuthListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        document.cookie = `sb-auth-token=${session.access_token}; path=/; max-age=3600; SameSite=Lax; secure`;
      } else {
        document.cookie = 'sb-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
