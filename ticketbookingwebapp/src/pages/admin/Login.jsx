import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

/**
 * Premium AdminLogin redesigned with a Modern SaaS aesthetic.
 */
const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login(formData);
            if (res.success) {
                if (res.user.role === 'ADMIN') {
                    login(res.user, res.token);
                    navigate('/admin/dashboard');
                } else {
                    setError('Truy cập bị từ chối. Khu vực này dành riêng cho Quản trị viên.');
                }
            }
        } catch (err) {
            setError(err.message || 'Hệ thống đang bảo trì hoặc thông tin sai lệch.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="premium-login-page vh-100 d-flex align-items-center justify-content-center bg-slate-900 overflow-hidden position-relative">
            {/* Background Decorations */}
            <div className="decoration-blob-1 position-absolute top-0 start-0 translate-middle bg-indigo-gradient opacity-20 rounded-circle" style={{ width: '600px', height: '600px', filter: 'blur(80px)' }}></div>
            <div className="decoration-blob-2 position-absolute bottom-0 end-0 translate-middle-y bg-emerald-500 opacity-10 rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(100px)' }}></div>

            <div className="login-container animate-fade-in shadow-2xl rounded-5 overflow-hidden d-flex bg-white position-relative" style={{ width: '900px', maxWidth: '95%', minHeight: '550px', zIndex: 10 }}>
                {/* Visual Side */}
                <div className="login-visual-side w-50 bg-indigo-gradient d-none d-md-flex flex-column align-items-center justify-content-center p-5 text-white position-relative overflow-hidden">
                    <div className="visual-pattern position-absolute top-0 start-0 w-100 h-100 opacity-10"></div>
                    <div className="bg-white bg-opacity-10 rounded-circle mb-4 d-flex align-items-center justify-content-center shadow-lg transform-hover" style={{ width: '100px', height: '100px', backdropFilter: 'blur(10px)' }}>
                        <i className="bi bi-shield-lock-fill fs-1"></i>
                    </div>
                    <h1 className="fw-900 tracking-tightest mb-3 text-center fs-2">TICKETBOX <span className="fw-light opacity-50">ADMIN</span></h1>
                    <div className="divider bg-white opacity-20 rounded mb-4" style={{ width: '60px', height: '3px' }}></div>
                    <p className="text-center opacity-75 fw-medium small" style={{ maxWidth: '280px', lineHeight: '1.6' }}>
                        Hệ thống quản lý sự kiện và tối ưu hóa doanh thu hàng đầu khu vực.
                    </p>

                    <div className="mt-5 d-flex gap-3 small fw-bold opacity-40">
                        <span>SECURITY</span>
                        <span>•</span>
                        <span>PERFORMANCE</span>
                        <span>•</span>
                        <span>SCALE</span>
                    </div>
                </div>

                {/* Form Side */}
                <div className="login-form-side w-100 w-md-50 p-5 p-lg-5 d-flex flex-column justify-content-center bg-white">
                    <div className="form-header mb-5">
                        <h3 className="fw-900 text-slate-800 tracking-tightest mb-1">Xác thực Hệ thống</h3>
                        <p className="text-slate-400 small fw-medium">Chúng tôi cần xác nhận quyền hạn quản trị của bạn</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger px-4 py-3 border-0 rounded-4 small mb-4 animate-shake shadow-sm" role="alert">
                            <i className="bi bi-exclamation-octagon-fill me-2"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Email nội bộ</label>
                            <div className="input-group-premium bg-slate-50 rounded-4 px-4 py-1 border transition-all focus-within-indigo">
                                <div className="d-flex align-items-center w-100">
                                    <i className="bi bi-envelope-fill text-slate-300 me-3 fs-5"></i>
                                    <input
                                        type="email"
                                        className="form-control bg-transparent border-0 shadow-none py-3 text-slate-700 fw-bold"
                                        placeholder="admin@ticketbox.pro"
                                        required
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-900 text-slate-400 text-uppercase tracking-widest mb-2">Mã bảo mật</label>
                            <div className="input-group-premium bg-slate-50 rounded-4 px-4 py-1 border transition-all focus-within-indigo">
                                <div className="d-flex align-items-center w-100">
                                    <i className="bi bi-key-fill text-slate-300 me-3 fs-5"></i>
                                    <input
                                        type="password"
                                        className="form-control bg-transparent border-0 shadow-none py-3 text-slate-700 fw-bold"
                                        placeholder="••••••••"
                                        required
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-5">
                            <div className="form-check custom-checkbox">
                                <input className="form-check-input shadow-none" type="checkbox" id="remember" />
                                <label className="form-check-label small fw-bold text-slate-500" htmlFor="remember">
                                    Duy trì phiên làm việc
                                </label>
                            </div>
                            <a href="#" className="text-indigo-600 fw-bold small text-decoration-none">Quên mã?</a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-indigo-gradient w-100 py-3 rounded-pill fw-900 text-white shadow-indigo transition-all active-scale"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'BẮT ĐẦU PHIÊN'}
                        </button>
                    </form>

                    <div className="form-footer mt-auto pt-5 text-center">
                        <p className="text-slate-400 small fw-medium mb-0">
                            Liên hệ IT nếu gặp sự cố truy cập. <br />
                            <span className="opacity-50 mt-1 d-block">IP: 127.0.0.1 (Internal Only)</span>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                
                .premium-login-page { font-family: 'Inter', sans-serif; }
                .fw-900 { font-weight: 900; }
                .tracking-tightest { letter-spacing: -0.05em; }
                .tracking-widest { letter-spacing: 0.1em; }
                
                .bg-slate-900 { background-color: #0f172a !important; }
                .bg-indigo-gradient { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important; }
                .bg-emerald-500 { background-color: #10b981 !important; }
                .text-indigo-600 { color: #4f46e5 !important; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                .shadow-indigo { box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4); }
                
                .input-group-premium { border-color: #f1f5f9; }
                .focus-within-indigo:focus-within { border-color: #6366f1; background-color: white !important; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
                
                .btn-indigo-gradient:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5); }
                .active-scale:active { transform: scale(0.97); }
                
                .visual-pattern { background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0); background-size: 24px 24px; }
                .transform-hover:hover { transform: scale(1.1) rotate(5deg); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
};

export default AdminLogin;
