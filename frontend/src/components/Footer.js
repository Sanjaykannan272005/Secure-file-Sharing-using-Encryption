export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-600">© {new Date().getFullYear()} Secure File Sharing App</p>
        <p className="text-gray-500 text-sm mt-2">
          Files are encrypted client-side for maximum privacy and security
        </p>
      </div>
    </footer>
  );
}