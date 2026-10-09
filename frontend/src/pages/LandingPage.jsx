import React from 'react';
import { Link } from 'react-router-dom';
import {
  Kanban,
  Bug,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0B0F19] transition-colors selection:bg-brand-500 selection:text-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-28 lg:pb-36 border-b border-gray-100 dark:border-gray-800/80">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 to-indigo-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Software Engineering SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Deliver Software Faster.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-400 bg-clip-text text-transparent">
              Zero Defect Leakage.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            DevTrack unifies agile sprint planning, drag-and-drop Kanban execution, structured bug tracking, and executive telemetry into one modern developer workspace.
          </p>

          {/* Quick CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right" className="shadow-lg shadow-brand-500/25">
                Start Building Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Explore Live Demo
              </Button>
            </Link>
          </div>

          {/* Demo Credentials Quick Callout */}
          <div className="mt-12 max-w-xl mx-auto p-4 rounded-2xl bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Instant Demo Access (Seeded):
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                Password: Admin123!Strong / Pm123!Strong / Dev123!Strong
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                <span className="block text-[10px] text-gray-400 font-medium">Admin</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">admin@devtrack.io</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                <span className="block text-[10px] text-gray-400 font-medium">Project Manager</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">pm@devtrack.io</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700">
                <span className="block text-[10px] text-gray-400 font-medium">Developer</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">dev1@devtrack.io</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-24 bg-gray-50/50 dark:bg-[#0E1321] border-b border-gray-100 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
              Engineered For Engineering Teams
            </h2>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Everything required to plan, build, test, and release
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-6">
                <Kanban className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Drag-and-Drop Kanban Board
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Interactive real-time task board powered by dnd-kit. Move work fluidly across TODO, IN PROGRESS, REVIEW, and COMPLETED columns with optimistic updates and error rollback.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Priority tags & assignee avatars
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Instant MongoDB status persistence
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
                <Bug className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Professional Bug Tracking
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Structured defect reporting with reproduction steps, environments, actual vs expected outcomes, severity classification, and resolution audit notes.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Critical to low severity metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Threaded comments & resolution history
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Executive Analytics & Charts
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Interactive Recharts visualizations covering sprint task completion velocity, bug severity breakdown, upcoming delivery milestones, and recent team logs.
              </p>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Live API-aggregated KPIs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  Workload balancing across developers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Security Showcase */}
      <section className="py-24 border-b border-gray-100 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
                <Lock className="w-3.5 h-3.5" />
                Enterprise RBAC Architecture
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                Tailored Permissions for Every Engineering Role
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                Permissions are strictly enforced on the backend via Express middleware and validated tokens, guaranteeing complete data isolation and audit trails.
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>Admin</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold">FULL CONTROL</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Manage all users, delete projects, adjust roles, monitor system server health, and access full audit streams.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>Project Manager</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-bold">AGILE LEAD</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Create and manage projects, assign team members, create and allocate tasks, manage bugs, and inspect sprint velocity.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center justify-between">
                    <span>Developer</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">EXECUTION</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    View assigned projects & tasks, update status via drag-and-drop, participate in comment threads, report and resolve defects.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Preview Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-[#111827] text-white border border-gray-800 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono text-gray-400 ml-2">devtrack-rest-api.log</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">200 OK</span>
              </div>
              <pre className="font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto p-2">
{`// RESTful Role Guard Execution
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUz...
Payload: {
  "title": "Idempotency-Key handling",
  "project": "664c...",
  "assignedTo": "664d..."
}
=> Response 201 Created:
{
  "success": true,
  "message": "Task created successfully",
  "data": { ... }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 text-center relative overflow-hidden bg-brand-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to upgrade your engineering workflow?
          </h2>
          <p className="text-base text-brand-100 max-w-xl mx-auto mb-8">
            Experience the modern agile project management and bug tracking system built with production engineering standards.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-600 hover:bg-gray-100 font-semibold shadow-lg">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" className="border border-white/40 bg-brand-700/50 hover:bg-brand-700 text-white">
                Sign In With Demo Credentials
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
