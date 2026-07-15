import { useState, useEffect } from 'react'
import useAuthStore from '../store/authStore'
import apiClient from '../api/axios'
import { toast } from 'react-hot-toast'

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const [authMode, setAuthMode] = useState(initialMode);
  
  // Learner registration fields
  const [learnerForm, setLearnerForm] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    profilePic: null
  });

  // Organization registration fields
  const [orgForm, setOrgForm] = useState({
    organizationName: '',
    organizationDescription: '',
    organizationProfilePicture: null,
    managerFirstName: '',
    managerLastName: '',
    managerEmail: '',
    managerUserName: '',
    managerPassword: ''
  });

  // Login fields
  const [loginForm, setLoginForm] = useState({
    emailOrUsername: '',
    password: ''
  });

  // Role toggle for register mode
  const [registerRole, setRegisterRole] = useState('learner'); // 'learner' | 'organization'
  
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(true);
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    setAuthMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7042';

  // Google OAuth redirect
  const handleGoogleAuth = () => {
    setAuthLoading(true);
    window.location.href = `${apiBaseUrl}/api/Auth/google-login`;
  };

  // Submit Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setValidationErrors({});

    try {
      if (authMode === 'login') {
        const isEmail = loginForm.emailOrUsername.includes('@');
        const payload = {
          password: loginForm.password,
          ...(isEmail 
            ? { email: loginForm.emailOrUsername } 
            : { userName: loginForm.emailOrUsername })
        };

        const data = await apiClient.post('/api/Auth/login', payload, { showSuccessToast: true });
        
        resetAllForms();
        
        // C# backend uses PascalCase by default
        const token = data.Token || data.token;
        const rawUser = data.User || data.user || {};
        
        // Map to camelCase to prevent breaking frontend components
        const user = {
          id: rawUser.Id || rawUser.id,
          firstName: rawUser.FirstName || rawUser.firstName,
          lastName: rawUser.LastName || rawUser.lastName,
          email: rawUser.Email || rawUser.email,
          userName: rawUser.UserName || rawUser.userName,
          role: rawUser.Role || rawUser.role,
          profilePicUrl: rawUser.ProfilePicUrl || rawUser.profilePicUrl
        };

        if (onLoginSuccess) {
          setTimeout(() => onLoginSuccess(token, rememberMe, user), 800);
        } else {
          setAuth(user, token, rememberMe);
          setTimeout(() => { onClose(); }, 1500);
        }

      } else if (registerRole === 'learner') {
        const bodyFormData = new FormData();
        bodyFormData.append('FirstName', learnerForm.firstName);
        bodyFormData.append('LastName', learnerForm.lastName);
        bodyFormData.append('UserName', learnerForm.userName);
        bodyFormData.append('Email', learnerForm.email);
        bodyFormData.append('PasswordHash', learnerForm.password);
        if (learnerForm.profilePic) {
          bodyFormData.append('ProfilePic', learnerForm.profilePic);
        }

        await apiClient.post('/api/Auth/register-learner', bodyFormData, { showSuccessToast: true });
        
        setTimeout(() => setAuthMode('login'), 2500);

      } else {
        const bodyFormData = new FormData();
        bodyFormData.append('OrganizationName', orgForm.organizationName);
        bodyFormData.append('OrganizationDescription', orgForm.organizationDescription);
        if (orgForm.organizationProfilePicture) {
          bodyFormData.append('OrganizationProfilePicture', orgForm.organizationProfilePicture);
        }
        bodyFormData.append('ManagerFirstName', orgForm.managerFirstName);
        bodyFormData.append('ManagerLastName', orgForm.managerLastName);
        bodyFormData.append('ManagerEmail', orgForm.managerEmail);
        bodyFormData.append('ManagerUserName', orgForm.managerUserName);
        bodyFormData.append('ManagerPassword', orgForm.managerPassword);

        await apiClient.post('/api/Auth/register-organization', bodyFormData, { showSuccessToast: true });

        setTimeout(() => setAuthMode('login'), 2500);
      }
    } catch (err) {
      if (err.isValidationError) {
        setValidationErrors(err.errors);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const resetAllForms = () => {
    setLearnerForm({ firstName: '', lastName: '', userName: '', email: '', password: '', profilePic: null });
    setOrgForm({ organizationName: '', organizationDescription: '', organizationProfilePicture: null, managerFirstName: '', managerLastName: '', managerEmail: '', managerUserName: '', managerPassword: '' });
    setLoginForm({ emailOrUsername: '', password: '' });
    setValidationErrors({});
    setShowPassword(false);
    setRememberMe(true);
  };

  // Reusable label + input renderer
  const renderField = (label, name, value, onChange, type = 'text', placeholder = '') => {
    const isPasswordType = type === 'password';
    const inputType = isPasswordType && showPassword ? 'text' : type;
    
    // Check validation error (Backend uses PascalCase e.g., 'FirstName', 'PasswordHash')
    const backendKey = name === 'password' ? 'PasswordHash' : (name.charAt(0).toUpperCase() + name.slice(1));
    const errorArr = validationErrors[name] || validationErrors[backendKey];
    const errorMsg = errorArr && errorArr.length > 0 ? errorArr[0] : null;

    return (
      <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--matrix-text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{label}</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={inputType}
            name={name}
            className="form-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            style={{ 
              width: '100%', 
              paddingRight: isPasswordType ? '2.5rem' : '1rem',
              borderColor: errorMsg ? '#ff3355' : undefined 
            }}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '0.75rem', background: 'none', border: 'none',
                color: 'var(--matrix-text-secondary)', cursor: 'pointer', padding: '0.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"></path></svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          )}
        </div>
        {errorMsg && <span style={{ color: '#ff3355', fontSize: '0.75rem', marginTop: '0.1rem' }}>{errorMsg}</span>}
      </div>
    );
  };

  return (
    <div className="modal-overlay" onClick={() => { onClose(); resetAllForms(); }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={() => { onClose(); resetAllForms(); }}>&times;</button>
        
        {/* Tab Toggle: Sign In / Sign Up */}
        <div className="auth-tabs" style={{ display: 'flex', borderBottom: '2px solid var(--matrix-border)', marginBottom: '0.75rem' }}>
          <button 
            style={{
              flex: 1, background: 'none', border: 'none',
              color: authMode === 'login' ? 'var(--matrix-primary)' : 'var(--matrix-text-secondary)',
              borderBottom: authMode === 'login' ? '2.5px solid var(--matrix-primary)' : 'none',
              padding: '0.75rem', cursor: 'pointer', fontWeight: 700,
              fontFamily: 'var(--font-mono)', fontSize: '0.95rem'
            }}
            onClick={() => { setAuthMode('login'); setValidationErrors({}); }}
          >
            Sign In
          </button>
          <button 
            style={{
              flex: 1, background: 'none', border: 'none',
              color: authMode === 'register' ? 'var(--matrix-primary)' : 'var(--matrix-text-secondary)',
              borderBottom: authMode === 'register' ? '2.5px solid var(--matrix-primary)' : 'none',
              padding: '0.75rem', cursor: 'pointer', fontWeight: 700,
              fontFamily: 'var(--font-mono)', fontSize: '0.95rem'
            }}
            onClick={() => { setAuthMode('register'); setValidationErrors({}); }}
          >
            Sign Up
          </button>
        </div>

        <h3 className="modal-title">{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
        <p className="modal-desc" style={{ fontSize: '0.85rem' }}>
          {authMode === 'login' 
            ? 'Sign in with your email or username to access your dashboard.' 
            : 'Join SkillMatrix to track competencies and build engineering career plans.'}
        </p>

        {/* Feedback alerts */}
        {validationErrors.global && (
          <div className="auth-alert error" style={{ padding: '0.75rem', backgroundColor: 'rgba(255, 51, 85, 0.1)', color: '#ff3355', borderRadius: '4px', border: '1px solid #ff3355', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {validationErrors.global}
          </div>
        )}

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

          {/* ===== LOGIN FIELDS ===== */}
          {authMode === 'login' && (
            <>
              {renderField('Email or Username', 'emailOrUsername', loginForm.emailOrUsername, 
                (e) => setLoginForm(prev => ({ ...prev, emailOrUsername: e.target.value })),
                'text', 'name@example.com or johndoe'
              )}
              {renderField('Password', 'password', loginForm.password,
                (e) => setLoginForm(prev => ({ ...prev, password: e.target.value })),
                'password', '••••••••'
              )}
              {/* Remember Me */}
              <label style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                fontSize: '0.85rem', color: 'var(--matrix-text-secondary)', fontFamily: 'var(--font-sans)',
                userSelect: 'none', marginTop: '-0.25rem'
              }}>
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ 
                    width: '16px', height: '16px', cursor: 'pointer',
                    accentColor: 'var(--matrix-primary)'
                  }}
                />
                Remember me
              </label>
            </>
          )}

          {/* ===== REGISTER FIELDS ===== */}
          {authMode === 'register' && (
            <>
              {/* Role Toggle */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--matrix-text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Account Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button"
                    className={`btn ${registerRole === 'learner' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => setRegisterRole('learner')}
                  >Learner</button>
                  <button type="button"
                    className={`btn ${registerRole === 'organization' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem', justifyContent: 'center' }}
                    onClick={() => setRegisterRole('organization')}
                  >Organization</button>
                </div>
              </div>

              {/* --- Learner Form --- */}
              {registerRole === 'learner' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    {renderField('First Name', 'firstName', learnerForm.firstName,
                      (e) => setLearnerForm(prev => ({ ...prev, firstName: e.target.value })),
                      'text', 'John'
                    )}
                    {renderField('Last Name', 'lastName', learnerForm.lastName,
                      (e) => setLearnerForm(prev => ({ ...prev, lastName: e.target.value })),
                      'text', 'Doe'
                    )}
                  </div>
                  {renderField('Username', 'userName', learnerForm.userName,
                    (e) => setLearnerForm(prev => ({ ...prev, userName: e.target.value })),
                    'text', 'johndoe'
                  )}
                  {renderField('Email Address', 'email', learnerForm.email,
                    (e) => setLearnerForm(prev => ({ ...prev, email: e.target.value })),
                    'email', 'name@example.com'
                  )}
                  {renderField('Password', 'password', learnerForm.password,
                    (e) => setLearnerForm(prev => ({ ...prev, password: e.target.value })),
                    'password', 'Min 8 chars, 1 upper, 1 lower, 1 number, 1 special'
                  )}
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--matrix-text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Profile Picture <span style={{ color: 'var(--matrix-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      style={{ paddingTop: '0.5rem' }}
                      onChange={(e) => setLearnerForm(prev => ({ ...prev, profilePic: e.target.files[0] || null }))}
                    />
                  </div>
                </>
              )}

              {/* --- Organization Form --- */}
              {registerRole === 'organization' && (
                <>
                  {/* Org Details Section */}
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--matrix-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.35rem' }}>
                    Company Details
                  </div>
                  {renderField('Organization Name', 'organizationName', orgForm.organizationName,
                    (e) => setOrgForm(prev => ({ ...prev, organizationName: e.target.value })),
                    'text', 'Acme Corp'
                  )}
                  {renderField('Description', 'organizationDescription', orgForm.organizationDescription,
                    (e) => setOrgForm(prev => ({ ...prev, organizationDescription: e.target.value })),
                    'text', 'Brief company overview (optional)'
                  )}
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--matrix-text-primary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Company Logo <span style={{ color: 'var(--matrix-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      style={{ paddingTop: '0.5rem' }}
                      onChange={(e) => setOrgForm(prev => ({ ...prev, organizationProfilePicture: e.target.files[0] || null }))}
                    />
                  </div>

                  {/* Manager Account Section */}
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--matrix-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--matrix-border)', paddingBottom: '0.35rem', marginTop: '0.5rem' }}>
                    Manager Account
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    {renderField('First Name', 'managerFirstName', orgForm.managerFirstName,
                      (e) => setOrgForm(prev => ({ ...prev, managerFirstName: e.target.value })),
                      'text', 'Jane'
                    )}
                    {renderField('Last Name', 'managerLastName', orgForm.managerLastName,
                      (e) => setOrgForm(prev => ({ ...prev, managerLastName: e.target.value })),
                      'text', 'Smith'
                    )}
                  </div>
                  {renderField('Manager Username', 'managerUserName', orgForm.managerUserName,
                    (e) => setOrgForm(prev => ({ ...prev, managerUserName: e.target.value })),
                    'text', 'janesmith'
                  )}
                  {renderField('Manager Email', 'managerEmail', orgForm.managerEmail,
                    (e) => setOrgForm(prev => ({ ...prev, managerEmail: e.target.value })),
                    'email', 'manager@company.com'
                  )}
                  {renderField('Manager Password', 'managerPassword', orgForm.managerPassword,
                    (e) => setOrgForm(prev => ({ ...prev, managerPassword: e.target.value })),
                    'password', 'Min 8 characters'
                  )}
                </>
              )}
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            disabled={authLoading}
          >
            {authLoading 
              ? 'Processing...' 
              : authMode === 'login' 
                ? 'Sign In' 
                : registerRole === 'learner' 
                  ? 'Create Learner Account' 
                  : 'Register Organization'}
          </button>
        </form>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--matrix-text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', margin: '0.25rem 0' }}>
          <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--matrix-border)' }}></div>
          <span>OR</span>
          <div style={{ flex: 1, height: '1.5px', backgroundColor: 'var(--matrix-border)' }}></div>
        </div>

        {/* Google Authentication Button */}
        <button 
          type="button" 
          className="google-btn" 
          onClick={handleGoogleAuth}
          disabled={authLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
}
