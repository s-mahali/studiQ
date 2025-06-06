import Logo from "@/lib/Logo";
import React, { useState } from "react";
// import {Link}  from 'react-router';
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <header className="w-full  py-4 px-6 top-0 z-50  bg-gradient-to-r from-black to-slate-700">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* logo */}
        <Logo />

        {/* desktop navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6">
            {["Home", "Features", "Pricing", "About"].map((item) => (
              <li key={item}>
                <a
                  href={`/${item.toLowerCase()}`}
                  className="text-teal-500 hover:text-teal-700 font-medium transition-colors duration-200"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white px-6 border-b-2 border-white">
            Get Started
          </Button>

          
        </nav>
        <div>
          <ThemeToggle />
        </div>

        {/* mobile menu button */}
        <div className="md:hidden">
          <Button
            
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="text-teal-700"
          >
            <span>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />} 
            </span>

          </Button>
          
        </div>
      </div>

      {/* mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0  border-b shadow-md py-7 px-6 z-40 text-center">
          <ul className="flex flex-col gap-4">
            {["Home", "Features", "Pricing", "About"].map((item) => (
              <li key={item}>
                <a
                  href={`/${item.toLowerCase()}`}
                  className="text-teal-500 hover:text-teal-700 font-medium block py-2 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
