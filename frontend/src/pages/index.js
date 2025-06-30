import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import Layout from '../components/Layout';

export default function Home({ user, loading }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      const auth = getAuth();
      
      const provider = new GoogleAuthProvider();
      // Add scopes if needed
      provider.addScope('https://www.googleapis.com/auth/userinfo.email');
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
      
      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google login error:', error);
      setAuthError(error.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setAuthError(null);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login error:', error);
      setAuthError(error.message);
    }
  };

  return (
    <Layout title="Secure File Sharing" user={user}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Secure File Sharing</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Share files securely with end-to-end encryption. Your files are encrypted before they leave your device,
            ensuring that only you and your intended recipients can access the content.
          </p>
          
          {!loading && !user ? (
            <div className="max-w-md mx-auto">
              {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {authError}
                </div>
              )}
              
              <button 
                onClick={handleGoogleLogin}
                className="btn btn-primary text-lg px-8 py-3 w-full mb-4"
              >
                Sign in with Google
              </button>
              
              <div className="text-center my-4">
                <span className="px-2 bg-white text-gray-500">or sign in with email</span>
              </div>
              
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-2 border rounded"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="btn btn-secondary text-lg px-8 py-3 w-full"
                >
                  Sign in
                </button>
              </form>
            </div>
          ) : loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : null}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">End-to-End Encryption</h2>
            <p>
              Files are encrypted on your device before upload using AES-256 encryption.
              The encryption keys never leave your device, ensuring maximum security.
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Secure Sharing</h2>
            <p>
              Share files with temporary links that expire automatically.
              Control who can access your files and for how long.
            </p>
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Privacy Focused</h2>
            <p>
              We don't have access to your unencrypted files.
              Your privacy is protected by design, not just by policy.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}