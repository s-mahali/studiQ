import React from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CircleFadingPlus,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}

      {/* <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          Column 1 - About
          <div>
            <h3 className="text-xl font-bold text-white mb-4">StudiQ</h3>
            <p className="mb-4">
              Connecting students worldwide to collaborate, share resources, and
              achieve academic excellence together.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="#"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-teal-400 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              
            </div>
          </div>

          Column 2 - Quick Links
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-400 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          Column 3 - Contact Us
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="mr-2 h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>support@studiq.com</span>
              </li>
              <li className="flex items-start">
                <Phone className="mr-2 h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>+91 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>123 Education Ave, Knowledge City, Jsr 94000</span>
              </li>
            </ul>
          </div>

          
         
        </div>
      </div> */}

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-4 md:mb-0">
            &copy; {currentYear} StudiQ. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-teal-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-teal-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-teal-400 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
