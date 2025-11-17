import React, { useState } from 'react';
import { Role } from '../types';
import { Hospital } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (id: number, role: Role) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<Role>(Role.Student);
  const [id, setId] = useState<number>(1);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(id, role);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary to-brand-primary-dark">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="p-4 bg-brand-primary rounded-full mb-4">
            <Hospital className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Amrita Clinical Care
          </h2>
          <p className="mt-2 text-center text-sm text-brand-text">
            Your campus health partner.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-primary-dark focus:border-brand-primary-dark focus:z-10 sm:text-sm"
              >
                <option value={Role.Student}>Student</option>
                <option value={Role.Doctor}>Doctor</option>
                <option value={Role.Nurse}>Nurse</option>
                <option value={Role.Admin}>Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="id" className="sr-only">ID</label>
              <input
                id="id"
                name="id"
                type="number"
                required
                min="1"
                value={id}
                onChange={(e) => setId(parseInt(e.target.value, 10))}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-primary-dark focus:border-brand-primary-dark focus:z-10 sm:text-sm"
                placeholder={role === Role.Admin ? "Admin ID (use 1)" : "Enter your ID (e.g., 1, 2, 3)"}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary-dark transition-colors duration-300"
            >
              Sign in
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-brand-text">
           For demo purposes, use IDs 1, 2, or 3 for Students/Staff. Use ID 1 for Admin.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
