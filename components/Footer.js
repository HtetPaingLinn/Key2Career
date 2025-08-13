import { FaLinkedin, FaFacebook, FaYoutube, FaInstagram, FaTwitter, FaPinterest } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="w-full bg-black text-white pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-8 border-b border-white/20">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <img 
              src="/footerlogo.png" 
              alt="Key2Career Logo" 
              className="w-[100px] h-[75px] object-contain"
            />
          </div>
          <div className="flex-1 text-center md:text-left text-sm mb-6 md:mb-0">Key2Career's AI-powered tools help you land your dream job faster.</div>
          <div className="flex gap-2 justify-center md:justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-full text-base">Get Started</button>
          </div>
          <div className="flex gap-4 ml-6">
            <FaLinkedin className="w-6 h-6 hover:text-blue-400" />
            <FaFacebook className="w-6 h-6 hover:text-blue-400" />
            <FaYoutube className="w-6 h-6 hover:text-red-500" />
            <FaInstagram className="w-6 h-6 hover:text-pink-400" />
            <FaTwitter className="w-6 h-6 hover:text-gray-400" />
            <FaPinterest className="w-6 h-6 hover:text-red-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10 border-b border-white/20 text-sm">
          <div>
            <div className="font-bold mb-3">Key Features</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Full Job Portal</a></li>
              <li><a href="#" className="hover:underline">Smart Resume Builder</a></li>
              <li><a href="#" className="hover:underline">Blockchain CV Verification</a></li>
              <li><a href="#" className="hover:underline">User & Admin System</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3">AI Services</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">AI Interview Q&A</a></li>
              <li><a href="#" className="hover:underline">Voice Interview (Beta)</a></li>
              <li><a href="#" className="hover:underline">AI Career Roadmap</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3">Platform</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <div className="font-bold mb-3">Support</div>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Contact</a></li>
              <li><a href="#" className="hover:underline">FAQ</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="font-bold mb-3">Customer Service</div>
            <div className="mb-2">Phone: <a href="tel:8443517484" className="font-bold hover:underline">844-351-7484</a></div>
            <div className="mb-2">Email: <a href="mailto:customerservice@key2career.com" className="hover:underline">support@key2career.com</a></div>
            <div className="mb-2">Support Hours:</div>
            <ul className="text-xs space-y-1">
              <li>Mon–Fri: 8am–8pm CST</li>
              <li>Sat: 8am–5pm CST</li>
            </ul>
          </div>
        </div>
        <div className="py-6 text-xs text-gray-400 text-center">
          &copy;{new Date().getFullYear()} Key2Career. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 