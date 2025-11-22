import React, { useState } from 'react';
import { supabase, saveSupabaseConfig, getSupabaseConfig } from '../services/supabase';
import { Loader2, Settings, LogIn, ArrowRight, Database } from 'lucide-react';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSettings, setShowSettings] = useState(!getSupabaseConfig().url);
  const [configUrl, setConfigUrl] = useState(getSupabaseConfig().url);
  const [configKey, setConfigKey] = useState(getSupabaseConfig().key);
  const [message, setMessage] = useState<{type: 'error'|'success', text: string} | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
        setMessage({ type: 'error', text: '请先配置数据库连接' });
        setShowSettings(true);
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
        setMessage({ type: 'success', text: '注册成功！请查看邮箱确认，或直接登录（如果关闭了邮箱验证）' });
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

  const handleSaveSettings = () => {
      if(!configUrl || !configKey) {
          setMessage({ type: 'error', text: '请填写完整的 URL 和 Key' });
          return;
      }
      saveSupabaseConfig(configUrl, configKey);
  };

  if (showSettings) {
      return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 space-y-6 animate-scale-in">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">连接云端数据库</h1>
                    <p className="text-gray-500 text-sm mt-2">请输入 Supabase 的项目信息以启用同步功能</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Project URL</label>
                        <input 
                            type="text" 
                            value={configUrl}
                            onChange={e => setConfigUrl(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="https://xyz.supabase.co"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Anon Public Key</label>
                        <input 
                            type="password" 
                            value={configKey}
                            onChange={e => setConfigKey(e.target.value)}
                            className="w-full bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                        />
                    </div>
                </div>
                
                {message && (
                    <div className={`p-3 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {message.text}
                    </div>
                )}

                <button 
                    onClick={handleSaveSettings}
                    className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                    保存并重启
                </button>
                
                {getSupabaseConfig().url && (
                    <button onClick={() => setShowSettings(false)} className="w-full text-gray-400 text-sm mt-4 hover:text-gray-600">返回登录</button>
                )}
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-8 space-y-8 animate-scale-in relative">
        
        <button 
            onClick={() => setShowSettings(true)}
            className="absolute top-6 right-6 text-gray-300 hover:text-gray-600 transition-colors"
        >
            <Settings size={20} />
        </button>

        <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">CareerTrack</h1>
            <p className="text-gray-500">秋招进度管理助手</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-4">
                <div className="group">
                    <input
                        type="email"
                        required
                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 transition-all outline-none"
                        placeholder="邮箱地址"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="group">
                    <input
                        type="password"
                        required
                        className="w-full bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 transition-all outline-none"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-sm flex items-start gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    <div className="mt-0.5 shrink-0">
                        {message.type === 'error' ? '!' : '✓'}
                    </div>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-900 hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <>
                        {isSignUp ? '注册账号' : '登录'}
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </form>

        <div className="text-center">
            <button
                type="button"
                onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage(null);
                }}
                className="text-sm text-gray-500 font-medium hover:text-blue-600 transition-colors"
            >
                {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
            </button>
        </div>
      </div>
    </div>
  );
};