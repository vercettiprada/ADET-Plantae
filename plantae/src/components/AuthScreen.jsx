import React, { useState } from 'react';

const AuthScreen = ({ loading, error, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateRegistration = () => {
    if (username.trim().length < 3) {
      return 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      return 'Email is required.';
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email.trim())) {
      return 'Enter a valid email address.';
    }

    if (password.length < 8) {
      return 'Password must be at least 8 characters.';
    }

    return '';
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    resetForm();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isLogin) {
      if (!username.trim() || !password.trim()) {
        return;
      }

      onLogin({ username: username.trim(), password });
      return;
    }

    if (!username.trim() || !email.trim() || !password.trim()) {
      return;
    }

    const validationError = validateRegistration();
    if (validationError) {
      onRegister({
        error: validationError,
      });
      return;
    }

    onRegister({
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-copy">
          <h1 className="brand-script">Plantae.</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to your sanctuary' : 'Create your sanctuary account'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field-shell">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="username"
            />
          </label>

          {!isLogin ? (
            <label className="field-shell">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
          ) : null}

          <label className="field-shell">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </label>

          {error ? <p className="form-message error">{error}</p> : null}

          <button className="primary-button auth-button" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Enter Garden' : 'Register'}
          </button>
        </form>

        <button className="text-button auth-toggle" type="button" onClick={switchMode} disabled={loading}>
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </button>
      </section>
    </main>
  );
};

export default AuthScreen;
