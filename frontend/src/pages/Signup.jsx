import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);
    
    try {
      await signup(formData);
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.fields) {
        setFieldErrors(err.response.data.fields);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 auth-card p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 border-b-2 border-indigo-500 pb-2 inline-block mx-auto">
            Task Manager
          </h2>
          <h3 className="mt-6 text-center text-xl font-medium text-gray-700">Create an account</h3>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 px-3 py-2 border ${fieldErrors.name ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                  placeholder="John Doe"
                />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 px-3 py-2 border ${fieldErrors.email ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                  placeholder="name@example.com"
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 px-3 py-2 border ${fieldErrors.password ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
              <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters, 1 uppercase, 1 number.</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create account'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
