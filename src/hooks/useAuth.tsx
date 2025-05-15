
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string, role?: "user" | "admin") => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success("Sign up successful! Please check your email for confirmation.");
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    }
  };

  const signIn = async (email: string, password: string, role: "user" | "admin" = "user") => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if the user is blocked
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      if (profileData.role === 'blocked') {
        await supabase.auth.signOut();
        throw new Error('Your account has been blocked. Please contact the administrator.');
      }

      // Check if the user is trying to access the right interface
      if (profileData.role !== role && profileData.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error(`You don't have ${role} privileges. Please use the correct login option.`);
      }

      toast.success("Successfully logged in!");
      
      // Redirect based on role
      if (role === 'admin' || profileData.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/employee-dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during login");
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      toast.success("Successfully logged out!");
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || "An error occurred during logout");
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
