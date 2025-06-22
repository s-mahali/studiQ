import Logo from "@/lib/Logo";
import React, { useState } from "react";
// import {Link}  from 'react-router';
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isLogin = useSelector((state) => state.auth.status);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto flex items-center py-4 px-6">
        <span>
          <Logo />
        </span>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8 mx-auto">
          <ul className="flex gap-6">
            {["Home", "Features", "Pricing", "About"].map((item) => (
              <li key={item}>
                <Link
                  to={`/${item.toLowerCase()}`}
                  className="text-white hover:text-teal-400 font-medium transition-colors duration-200"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          {!isLogin && (
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white px-6 border-b-2 border-white cursor-pointer">
                Get Started
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="text-white bg-transparent hover:bg-white/10"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/80 backdrop-blur-md border-b shadow-md py-7 px-6 z-40 text-center">
          <ul className="flex flex-col gap-4">
            {["Home", "Features", "Pricing", "About"].map((item) => (
              <li key={item}>
                <Link
                  to={`/${item.toLowerCase()}`}
                  className="text-white hover:text-teal-400 font-medium block py-2 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Link to="/signup">
              <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
