import React from "react";
import { Link } from "@tanstack/react-router";
import { WalletConnect } from "./WalletConnect";

export const Header: React.FC = () => {
  return (
    <header className="bg-primary border-b-4 border-accent">
      <div className="police-tape h-2 w-full"></div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <h1 className="font-heading text-4xl text-gold tracking-wider">
                $FIND
              </h1>
            </Link>
            <nav className="flex gap-6">
              <Link
                to="/"
                className="text-white hover:text-gold transition-colors font-medium"
                activeProps={{ className: "text-gold" }}
              >
                Live Feed
              </Link>
              <Link
                to="/gallery"
                className="text-white hover:text-gold transition-colors font-medium"
                activeProps={{ className: "text-gold" }}
              >
                Gallery
              </Link>
            </nav>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};
