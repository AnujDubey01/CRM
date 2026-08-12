import { useState } from 'react'
import Icon from '../components/ui/Icon'
import { loginUser, registerUser } from '../services/api.service'

function Login({ onLogin }) {
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('sales')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  const switchMode = () => {
    setMode(isSignup ? 'signin' : 'signup')
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setIsSubmitting(true)

    try {
      if (isSignup) {
        await registerUser({ name, email, password, role })
        setNotice('Account created. You can sign in now.')
        setMode('signin')
        setPassword('')
        return
      }

      const data = await loginUser({ email, password })

      if (!data.token) {
        throw new Error('Unable to sign in. Please try again.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      onLogin(data.user)
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete the request.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__hero">
        <div className="login-page__brand">
          <span className="login-page__logo"><Icon name="logo" /></span>
          <strong>OpsFlow</strong>
        </div>
        <div className="login-page__message">
          <h1>The operating system for<br />your distribution<br />business.</h1>
          <p>Streamline operations, manage inventory in real-time, and<br />gain actionable insights with our premium ERP command<br />center.</p>
        </div>
        <div className="login-page__trusted">
          <div className="login-page__faces" aria-hidden="true"><span>J</span><span>M</span><span>A</span></div>
          <b>Trusted by 10,000+ businesses</b>
        </div>
      </section>

      <section className="login-page__panel" aria-label={isSignup ? 'Create account' : 'Sign in'}>
        <form className="login-page__form" onSubmit={handleSubmit}>
          <div className="login-page__form-heading">
            <h2>{isSignup ? 'Create your operations account' : 'Sign in to your operations workspace'}</h2>
            <p>{isSignup ? 'Register a role-based workspace user for live ERP access.' : 'Enter your credentials to access the command center.'}</p>
          </div>

          {isSignup && (
            <label>
              Full Name
              <input className="login-page__input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Jane Doe" autoComplete="name" required />
            </label>
          )}

          <label>
            Email Address
            <input className="login-page__input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@company.com" autoComplete="email" required />
          </label>

          <label>
            Password
            <span className="login-page__password">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" autoComplete={isSignup ? 'new-password' : 'current-password'} required />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          {isSignup && (
            <label>
              Role
              <select className="login-page__input" value={role} onChange={(event) => setRole(event.target.value)} required>
                <option value="sales">Sales</option>
                <option value="warehouse">Warehouse</option>
                <option value="accounts">Accounts</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {!isSignup && <div className="login-page__options"><label className="login-page__remember"><input type="checkbox" />Remember me</label><button type="button">Forgot password?</button></div>}
          {notice && <p className="login-page__notice" role="status">{notice}</p>}
          {error && <p className="login-page__error" role="alert">{error}</p>}
          <button className="login-page__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}</button>

          {!isSignup && (
            <>
              <div className="login-page__divider"><span>or continue with</span></div>
              <div className="login-page__providers"><button type="button"><span>□</span>Google</button><button type="button"><span>▦</span>Microsoft</button></div>
            </>
          )}

          <p className="login-page__request">{isSignup ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={switchMode}>{isSignup ? 'Sign in' : 'Create account'}</button></p>
        </form>
      </section>
    </main>
  )
}

export default Login
