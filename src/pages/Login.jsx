import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, septError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [loginType, setLoginType] = useState('staff'); // 'staff' or 'hod'

    // Clear fields when toggling tabs
    useEffect(() => {
        setEmail('staff@kce.edu');
        setPassword('STAFF@CSE');
        setError('');
    }, [loginType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await login(email, password);
            if (res.success) {
                const loggedInUser = res.user;
                
                // Ensure Admin logs in via Staff tab (HOD can use either)
                if (loginType === 'hod' && loggedInUser.role !== 'hod') {
                    setError('This is the HOD login portal. Please use the Staff login tab.');
                    setLoading(false);
                    return;
                }
                // Removed the restriction that prevents HOD from using Staff tab
                // as it was causing user friction. HOD can now login through either.

                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('remembered_email', email);
                    localStorage.setItem('remembered_password', password);
                } else {
                    localStorage.removeItem('remembered_email');
                    localStorage.removeItem('remembered_password');
                }
                navigate('/dashboard');
            } else {
                setError(res.message || 'Authentication failed. Please check your credentials.');
            }
        } catch (err) {
            console.error("Login component error:", err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#111827] tracking-tight mb-2 uppercase italic leading-none">
                    KINGS COLLEGE OF ENGINEERING (AUTONOMOUS)
                </h1>
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic">Continuous Assessment Test Mark Portal</p>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">
                    <div className={`p-10 text-center ${loginType === 'hod' ? 'bg-indigo-900' : 'bg-blue-600'} relative transition-colors duration-500 overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="w-28 h-28 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl border-4 border-white/20 mb-6 relative">
                            <img
                                src="/images.jpg"
                                alt="KCE Logo"
                                className="w-24 h-24 object-contain"
                            />
                        </div>
                        <h2 className="text-white text-2xl font-black uppercase italic tracking-tighter">
                            {loginType === 'hod' ? 'HOD Login' : 'Admin / Staff'}
                        </h2>
                    </div>

                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setLoginType('staff')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest italic transition-all ${loginType === 'staff' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-400 bg-slate-50'}`}
                        >
                            Staff Login
                        </button>
                        <button 
                            onClick={() => setLoginType('hod')}
                            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest italic transition-all ${loginType === 'hod' ? 'text-indigo-900 border-b-2 border-indigo-900 bg-white' : 'text-slate-400 bg-slate-50'}`}
                        >
                            HOD Login
                        </button>
                    </div>

                    <div className="p-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] rounded-2xl border border-red-100 font-black uppercase italic">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest italic">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 pl-12 pr-6 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-sm"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1 tracking-widest italic">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl h-14 pl-12 pr-14 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-sm"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="peer sr-only" 
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <div className="w-5 h-5 border-2 border-slate-100 rounded-lg group-hover:border-blue-400 transition-all peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center bg-slate-50">
                                            <div className="w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-all scale-0 peer-checked:scale-100"></div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest italic group-hover:text-slate-800 transition-colors">Remember me</span>
                                </label>
                                <button type="button" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 tracking-widest italic font-bold">
                                    Forgot Access?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-16 ${loginType === 'hod' ? 'bg-indigo-900 hover:bg-slate-900 shadow-indigo-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'} text-white rounded-[2rem] font-black uppercase italic tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3`}
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                                {loading ? 'SYNCHRONIZING...' : `Sign In as ${loginType === 'hod' ? 'HOD' : 'Staff'}`}
                            </button>
                            
                        </form>
                    </div>
                </div>

                <p className="text-center mt-12 text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    &copy; 2026 Kings College of Engineering. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
