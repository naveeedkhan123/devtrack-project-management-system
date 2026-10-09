import React from 'react';
import { Layers, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0F19] py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                DevTrack
              </span>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Enterprise software development project management, agile Kanban workflows, and defect tracking system.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><Link to="/kanban" className="hover:text-brand-500 transition-colors">Kanban Board</Link></li>
              <li><Link to="/tasks" className="hover:text-brand-500 transition-colors">Task Management</Link></li>
              <li><Link to="/bugs" className="hover:text-brand-500 transition-colors">Bug & Defect Tracking</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-500 transition-colors">Executive Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3">
              Engineering
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><span>React 18 & Vite SPA</span></li>
              <li><span>Express & RESTful API</span></li>
              <li><span>MongoDB with Mongoose ODM</span></li>
              <li><span>JWT & Role-Based Authorization</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100 mb-3">
              Security & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
              <li><span>bcrypt Password Encryption</span></li>
              <li><span>Centralized Error Handling</span></li>
              <li><span>Rate Limiting & Helmet Guard</span></li>
              <li><span>Enterprise Audit Logs</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} DevTrack Systems. Built for high-velocity software engineering teams.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-rose-500 fill-current" /> for modern developers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
