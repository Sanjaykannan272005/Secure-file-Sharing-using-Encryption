import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children, title, user }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title ? `${title} | Secure File Sharing` : 'Secure File Sharing'}</title>
        <meta name="description" content="Secure file sharing with client-side encryption" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Header user={user} />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}