import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [loginType, setLoginType] = useState('staff'); // 'staff' or 'hod'

    // ✅ Autofill based on login type
    useEffect(() => {
        if (loginType === 'hod') {
            setEmail('hod@kce.edu');
            setPassword('HODCSE1234');
        } else {
            setEmail('staff@kce.edu');
            setPassword('STAFF@CSE');
        }
        setError('');
    }, [loginType]);

    // ✅ Handle Login
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // ✅ HOD Login
            if (email === 'hod@kce.edu' && password === 'HODCSE1234') {
                if (loginType !== 'hod') {
                    setError('Please use HOD login tab');
                    setLoading(false);
                    return;
                }

                localStorage.setItem('userRole', 'hod');
                navigate('/dashboard');
                return;
            }

            // ✅ Staff Login
            if (email === 'staff@kce.edu' && password === 'STAFF@CSE') {
                localStorage.setItem('userRole', 'staff');
                navigate('/dashboard');
                return;
            }

            // ❌ Invalid Login
            setError('Invalid email or password');

        } catch (err) {
            console.error(err);
            setError('Something went wrong');
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
                <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic">
                    Continuous Assessment Test Mark Portal
                </p>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200">

                    {/* Header */}
                    <div className={`p-10 text-center ${loginType === 'hod' ? 'bg-indigo-900' : 'bg-blue-600'}`}>
                        <h2 className="text-white text-2xl font-black uppercase italic">
                            {loginType === 'hod' ? 'HOD Login' : 'Staff Login'}
                        </h2>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b">
                        <button 
                            onClick={() => setLoginType('staff')}
                            className={`flex-1 py-3 ${loginType === 'staff' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                        >
                            Staff
                        </button>
                        <button 
                            onClick={() => setLoginType('hod')}
                            className={`flex-1 py-3 ${loginType === 'hod' ? 'text-indigo-900 border-b-2 border-indigo-900' : 'text-gray-400'}`}
                        >
                            HOD
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-8">
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 p-3 border rounded-lg"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 p-3 border rounded-lg"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white p-3 rounded-lg flex justify-center items-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <LogIn />}
                                Login
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
