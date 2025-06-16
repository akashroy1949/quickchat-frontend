// src/shared/components/Footer.jsx

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-6 py-8 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold mb-2">QuickChat</h3>
          <p className="text-sm">A modern chat app built for real-time conversations with smooth UI.</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Links</h3>
          <ul className="space-y-1 text-sm">
            <li><a href="/" className="hover:underline">Home</a></li>
            <li><a href="/login" className="hover:underline">Login</a></li>
            <li><a href="#" className="hover:underline">Docs</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold mb-2">Contact</h3>
          <p className="text-sm">Email: hello@quickchat.com</p>
          <p className="text-sm">Phone: +91-999-888-7777</p>
        </div>
      </div>
      <div className="text-center text-sm mt-6 border-t border-gray-700 pt-4">
        © {new Date().getFullYear()} QuickChat. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
