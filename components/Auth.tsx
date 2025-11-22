import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Loader2, ArrowRight, Mail, Lock } from 'lucide-react';

// Shared Layout for Auth and Settings to ensure consistency
interface CardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const CardLayout: React.FC<CardLayoutProps> = ({ children, title, subtitle }) => (
  <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6">
    {/* Main Card with iOS Shadow and Glass effect */}
    <div className="bg-white w-full max-w-[380px] rounded-[32px] shadow-ios p-8 space-y-8 animate-scale-in relative border border-white/50 z-10">
       <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#1C1C1E] tracking-tight">{title}</h1>
          <p className="text-[#8E8E93] text-sm font-medium">{subtitle}</p>
      </div>
      {children}
    </div>
    
    {/* Footer Text */}
    <div className="mt-8 text-center z-0">
       <p className="text-[#AEAEB2] text-xs font-medium tracking-wide">
           Designed for Career Success
       </p>
    </div>
  </div>
);

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
        setMessage({ type: 'error', text: '系统错误: 数据库未配置' });
        return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '注册成功！正在切换至登录...' });
        
        // Automatically switch to login view after short delay
        setTimeout(() => {
            setIsSignUp(false);
            setMessage({ type: 'success', text: '注册成功，请登录' });
        }, 1500);

      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardLayout title="CareerTrack" subtitle="秋招进度管理助手">
        <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-[#C7C7CC] group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="email"
                        required
                        className="w-full bg-[#F2F2F7] hover:bg-[#E5E5EA] focus:bg-white border border-transparent focus:border-blue-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-medium outline-none transition-all text-[#1C1C1E] placeholder-[#C7C7CC]"
                        placeholder="邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-[#C7C7CC] group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="password"
                        required
                        className="w-full bg-[#F2F2F7] hover:bg-[#E5E5EA] focus:bg-white border border-transparent focus:border-blue-500/20 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-medium outline-none transition-all text-[#1C1C1E] placeholder-[#C7C7CC]"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 animate-fade-in ${message.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {message.text}
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#000000] text-white font-semibold text-[15px] py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <>
                            {isSignUp ? '注册账号' : '进入应用'}
                            {!isSignUp && <ArrowRight size={18} />}
                        </>
                    )}
                </button>
            </div>
        </form>

        <div className="text-center">
            <button
                type="button"
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage(null);
                }}
                className="text-xs text-[#8E8E93] font-medium hover:text-blue-500 transition-colors"
            >
                {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
        </div>
    </CardLayout>
  );
};