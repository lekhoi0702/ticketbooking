import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const OrganizerLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // AdminLTE login page body class
        document.body.className = 'hold-transition login-page';

        return () => {
            document.body.className = '';
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.login(formData);
            if (res.success) {
                if (res.user.role === 'ORGANIZER' || res.user.role === 'ADMIN') {
                    login(res.user, res.token);
                    navigate('/organizer/dashboard');
                } else {
                    setError('Tài khoản này không có quyền quản lý sự kiện.');
                }
            }
        } catch (err) {
            setError(err.message || 'Thông tin đăng nhập không chính xác.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-box">
            <div className="card card-outline card-success">
                <div className="card-header text-center">
                    <a href="#" className="h1">
                        <b>TicketBox</b> Organizer
                    </a>
                </div>
                <div className="card-body">
                    <p className="login-box-msg">Đăng nhập để quản lý sự kiện</p>

                    {error && (
                        <div className="alert alert-danger alert-dismissible">
                            <button type="button" className="close" onClick={() => setError(null)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <i className="icon fas fa-ban"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group mb-3">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <span className="fas fa-envelope"></span>
                                </div>
                            </div>
                        </div>
                        <div className="input-group mb-3">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Mật khẩu"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="input-group-append">
                                <div className="input-group-text">
                                    <span className="fas fa-lock"></span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-8">
                                <div className="icheck-primary">
                                    <input type="checkbox" id="remember" />
                                    <label htmlFor="remember">
                                        Ghi nhớ đăng nhập
                                    </label>
                                </div>
                            </div>
                            <div className="col-4">
                                <button type="submit" className="btn btn-success btn-block" disabled={loading}>
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm mr-1"></span>
                                    ) : null}
                                    Đăng nhập
                                </button>
                            </div>
                        </div>
                    </form>

                    <p className="mb-1 mt-3">
                        <a href="#">Quên mật khẩu?</a>
                    </p>
                    <p className="mb-0">
                        <a href="#" className="text-center">Đăng ký làm đối tác</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrganizerLogin;
