import React from "react";
import { AdminPanel } from "../components/AdminPanel";

const AdminPage: React.FC = () => {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-heading text-5xl text-accent mb-4">
          🔐 ADMIN PANEL
        </h1>
        <p className="text-lg text-gray-300">
          Manage rounds and review submissions
        </p>
      </div>

      <AdminPanel />
    </div>
  );
};

export default AdminPage;
