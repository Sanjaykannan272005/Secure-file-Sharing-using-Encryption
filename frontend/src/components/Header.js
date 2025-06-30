import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';

export default function Header({ user }) {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      if (!auth) {
        console.error("Firebase auth not initialized");
        return;
      }
      
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          Secure File Sharing
        </Link>
        
        <nav>
          <ul className="flex items-center space-x-6">
            {user ? (
              <>
                <li>
                  <Link href="/dashboard" className={`${
                    router.pathname === '/dashboard' ? 'text-primary-600 font-medium' : 'text-gray-600 hover:text-primary-600'
                  }`}>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-4">{user.email}</span>
                    <button 
                      onClick={handleSignOut}
                      className="btn btn-secondary text-sm"
                    >
                      Sign Out
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <li>
                <Link href="/" className="btn btn-primary">
                  Sign In
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}