const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('../utils/logger');

const seedDatabase = async () => {
  try {
    logger.info('Purging existing database collections for clean seed...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Bug.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({}),
    ]);

    logger.info('Creating demo users...');
    // Demo users — passwords will be hashed by UserSchema pre-save hook
    const admin = await User.create({
      name: 'Naveed Khan',
      email: 'admin@devtrack.io',
      password: 'Admin123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: 'Head of Engineering & System Administrator at DevTrack. Overseeing infrastructure, DevOps pipelines, and cross-team delivery.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const pm = await User.create({
      name: 'Ayesha Khan',
      email: 'pm@devtrack.io',
      password: 'Pm123!',
      role: 'project_manager',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200',
      bio: 'Lead Technical Project Manager. Agile Scrum champion — specialising in sprint planning, stakeholder management, and delivery milestones.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const dev1 = await User.create({
      name: 'Hamza Ahmed',
      email: 'dev1@devtrack.io',
      password: 'Dev123!',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Senior Frontend Engineer. React, TypeScript, Tailwind CSS — crafting pixel-perfect, accessible UIs for millions of users.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const dev2 = await User.create({
      name: 'Hira Malik',
      email: 'dev2@devtrack.io',
      password: 'Dev123!',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Backend & Cloud Systems Engineer. Node.js, MongoDB, distributed architecture, and API security specialist.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const dev3 = await User.create({
      name: 'Bilal Raza',
      email: 'dev3@devtrack.io',
      password: 'Dev123!',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      bio: 'Full-Stack Software Engineer. API design, automated testing pipelines, and real-time data synchronisation.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    logger.info('Creating Pakistani startup projects...');

    const project1 = await Project.create({
      name: 'SehatConnect',
      key: 'SCT',
      description:
        'Digital healthcare platform for Pakistan — connecting patients with doctors for online appointments, e-prescriptions, and medical record management across urban and rural regions.',
      status: 'active',
      priority: 'high',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      manager: pm._id,
      members: [pm._id, dev1._id, dev2._id, dev3._id],
      createdBy: admin._id,
    });

    const project2 = await Project.create({
      name: 'RozgarHub',
      key: 'RZG',
      description:
        'Pakistan\'s talent marketplace — connecting skilled trade workers (plumbers, electricians, carpenters, drivers) with local job opportunities and employers through a verified, ratings-driven platform.',
      status: 'active',
      priority: 'high',
      startDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      manager: pm._id,
      members: [pm._id, dev2._id, dev3._id],
      createdBy: pm._id,
    });

    const project3 = await Project.create({
      name: 'KisanLink',
      key: 'KSN',
      description:
        'AgriTech platform bridging the gap between Pakistani farmers and markets — real-time commodity prices, weather alerts, government subsidy tracking, and direct-to-buyer produce listings.',
      status: 'planning',
      priority: 'medium',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000),
      manager: admin._id,
      members: [admin._id, dev1._id, dev3._id],
      createdBy: admin._id,
    });

    const project4 = await Project.create({
      name: 'EduBridge',
      key: 'EDU',
      description:
        'EdTech platform helping Pakistani students find affordable courses, scholarships, and mentorship programs — with Urdu-language content support and low-bandwidth optimised delivery.',
      status: 'completed',
      priority: 'medium',
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      manager: pm._id,
      members: [pm._id, dev2._id],
      createdBy: admin._id,
    });

    logger.info('Creating demo tasks across Kanban columns...');
    const tasks = await Task.insertMany([
      // ── SCT (SehatConnect) Tasks ──────────────────────────────
      {
        title: 'Build patient appointment booking flow',
        description:
          'Implement multi-step booking wizard: select doctor → choose speciality → pick available slot → confirm with OTP. Integrate with SMS gateway for Pakistani mobile networks.',
        project: project1._id,
        assignedTo: dev1._id,
        createdBy: pm._id,
        priority: 'high',
        status: 'completed',
        order: 0,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'UX', 'SMS'],
        commentsCount: 2,
      },
      {
        title: 'Design JWT authentication & RBAC middleware',
        description:
          'Secure all REST endpoints with Bearer token auth and role-based access checks for Patient, Doctor, Admin, and Pharmacy roles.',
        project: project1._id,
        assignedTo: dev2._id,
        createdBy: admin._id,
        priority: 'critical',
        status: 'completed',
        order: 1,
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Security', 'Auth'],
        commentsCount: 1,
      },
      {
        title: 'Implement doctor availability calendar',
        description:
          'Build weekly availability grid for doctors to manage consultation slots with timezone support (PKT UTC+5). Block-off recurring leaves and public holidays.',
        project: project1._id,
        assignedTo: dev1._id,
        createdBy: pm._id,
        priority: 'high',
        status: 'in_progress',
        order: 0,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'Calendar', 'UX'],
        commentsCount: 3,
      },
      {
        title: 'Video consultation WebRTC integration',
        description:
          'Integrate Agora.io SDK for low-latency video calls optimised for Pakistan\'s 3G/4G connectivity. Implement fallback to audio-only mode on poor connections.',
        project: project1._id,
        assignedTo: dev3._id,
        createdBy: pm._id,
        priority: 'medium',
        status: 'review',
        order: 0,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        labels: ['WebRTC', 'Video', 'Integration'],
        commentsCount: 0,
      },
      {
        title: 'Write Jest integration test suite for appointments API',
        description:
          'Cover booking creation, slot conflict detection, cancellation refund policy, and push notification triggers for appointment reminders.',
        project: project1._id,
        assignedTo: dev2._id,
        createdBy: pm._id,
        priority: 'high',
        status: 'todo',
        order: 0,
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        labels: ['Testing', 'Backend', 'CI/CD'],
        commentsCount: 1,
      },
      {
        title: 'Urdu language support & RTL layout',
        description:
          'Add Urdu translations for all patient-facing screens. Implement RTL layout switching using CSS logical properties. Test with Noto Nastaliq Urdu font rendering.',
        project: project1._id,
        assignedTo: dev1._id,
        createdBy: pm._id,
        priority: 'medium',
        status: 'todo',
        order: 1,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        labels: ['i18n', 'Urdu', 'Frontend'],
        commentsCount: 0,
      },

      // ── RZG (RozgarHub) Tasks ─────────────────────────────────
      {
        title: 'Worker skill verification & badge system',
        description:
          'Implement CNIC-based identity verification, trade skill assessment quizzes, and digital badge issuance for verified workers. Integrate with NADRA API simulation.',
        project: project2._id,
        assignedTo: dev2._id,
        createdBy: pm._id,
        priority: 'critical',
        status: 'in_progress',
        order: 0,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Verification', 'Trust'],
        commentsCount: 1,
      },
      {
        title: 'Real-time job matching algorithm',
        description:
          'Build proximity-based job recommendation engine using geolocation (latitude/longitude) to match workers with nearby job postings. Support city-level filtering for Lahore, Karachi, Islamabad.',
        project: project2._id,
        assignedTo: dev3._id,
        createdBy: pm._id,
        priority: 'critical',
        status: 'todo',
        order: 0,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        labels: ['Algorithm', 'Geolocation', 'Backend'],
        commentsCount: 0,
      },
      {
        title: 'JazzCash & Easypaisa payment integration',
        description:
          'Integrate Pakistan\'s top mobile wallets — JazzCash and Easypaisa — for worker payout processing. Implement escrow hold and release on job completion confirmation.',
        project: project2._id,
        assignedTo: dev2._id,
        createdBy: pm._id,
        priority: 'high',
        status: 'review',
        order: 0,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        labels: ['Payments', 'JazzCash', 'Easypaisa'],
        commentsCount: 0,
      },

      // ── KSN (KisanLink) Tasks ─────────────────────────────────
      {
        title: 'Live commodity price feed from PAMA & REAP',
        description:
          'Aggregate real-time mandi prices for wheat, cotton, rice, sugarcane from Pakistan Agricultural Markets Association and REAP data feeds. Display trend charts with 7-day history.',
        project: project3._id,
        assignedTo: dev3._id,
        createdBy: admin._id,
        priority: 'high',
        status: 'todo',
        order: 0,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        labels: ['AgriData', 'API', 'Charts'],
        commentsCount: 0,
      },
    ]);

    logger.info('Creating demo bugs...');
    const bugs = await Bug.insertMany([
      {
        title: 'OTP SMS delivery fails on Zong network numbers',
        description:
          'Appointment booking OTP messages are not delivered to Zong subscribers (prefix 031x). Twilio gateway shows "delivered" but users never receive the SMS.',
        project: project1._id,
        reportedBy: dev3._id,
        assignedTo: dev1._id,
        severity: 'high',
        priority: 'high',
        status: 'in_progress',
        environment: 'Staging / Zong SIM',
        stepsToReproduce:
          '1. Enter a Zong mobile number (031x) during booking OTP step\n2. Click "Send OTP"\n3. Wait 60 seconds — no message received\n4. Retry — still no delivery',
        expectedResult: 'OTP arrives within 30 seconds on all Pakistani networks (Jazz, Zong, Ufone, Telenor).',
        actualResult: 'OTP delivered on Jazz and Telenor, silently dropped on Zong and Ufone numbers.',
        resolutionNotes: 'Investigating DLT registration status with Twilio Pakistan local sender ID.',
        commentsCount: 2,
      },
      {
        title: 'JWT token expiry causes silent dashboard freeze',
        description:
          'When the session token expires after 7 days, background API calls fail silently without redirecting the user to the login screen.',
        project: project1._id,
        reportedBy: dev1._id,
        assignedTo: dev2._id,
        severity: 'high',
        priority: 'critical',
        status: 'resolved',
        environment: 'Production',
        stepsToReproduce:
          '1. Set token to an expired value in localStorage\n2. Refresh the page\n3. Observe dashboard loading spinner',
        expectedResult: 'Axios interceptor catches 401, clears session, and redirects to /login.',
        actualResult: 'Dashboard shows a permanent loading skeleton with no error.',
        resolutionNotes:
          'Resolved: Attached global Axios response interceptor in api.js to detect 401 and redirect to /login?session=expired.',
        commentsCount: 1,
      },
      {
        title: 'JazzCash escrow double-debit on network timeout',
        description:
          'When JazzCash API times out during payment confirmation, retried webhook hits the server before the transaction lock releases — resulting in two debit entries for the same job.',
        project: project2._id,
        reportedBy: pm._id,
        assignedTo: dev2._id,
        severity: 'critical',
        priority: 'critical',
        status: 'open',
        environment: 'Production',
        stepsToReproduce:
          '1. Initiate a worker payout via JazzCash\n2. Simulate a 12-second API timeout\n3. JazzCash retries webhook after 5 seconds\n4. Inspect ledger — two debit records for same transaction',
        expectedResult: 'Idempotency key rejects the duplicate webhook and returns 200 without re-processing.',
        actualResult: 'Two separate ledger entries with identical reference numbers.',
        resolutionNotes: '',
        commentsCount: 3,
      },
      {
        title: 'Worker profile photo upload fails on slow 3G connections',
        description:
          'CNIC verification photo upload times out after 30 seconds on 3G connections. No retry mechanism — worker loses form progress and must restart the entire verification flow.',
        project: project2._id,
        reportedBy: dev2._id,
        assignedTo: dev2._id,
        severity: 'medium',
        priority: 'high',
        status: 'resolved',
        environment: 'Staging / 3G throttled',
        stepsToReproduce:
          '1. Throttle network to 3G (750kbps) in DevTools\n2. Upload a 2MB CNIC photo\n3. Wait for request — timeout at 30s\n4. Form resets to step 1',
        expectedResult: 'Chunked upload with progress indicator and resumable upload on reconnect.',
        actualResult: 'Hard timeout, full form reset, no progress saved.',
        resolutionNotes:
          'Resolved: Implemented chunked file upload with tus.io protocol. Progress state stored in sessionStorage to survive page refreshes.',
        commentsCount: 0,
      },
      {
        title: 'KisanLink crop price chart renders blank on mobile Safari',
        description:
          'The commodity price trend chart (Recharts BarChart) renders as a blank white box on iOS Safari 17. Data loads correctly but SVG paths are not painted.',
        project: project3._id,
        reportedBy: dev3._id,
        assignedTo: dev3._id,
        severity: 'medium',
        priority: 'high',
        status: 'open',
        environment: 'QA / iOS 17 Safari',
        stepsToReproduce:
          '1. Open KisanLink on iPhone (iOS 17, Safari)\n2. Navigate to commodity price page\n3. Chart container appears but SVG is empty',
        expectedResult: 'Bar chart renders correctly with price data on all browsers including iOS Safari.',
        actualResult: 'Blank white box where the chart should render.',
        resolutionNotes: '',
        commentsCount: 0,
      },
    ]);

    logger.info('Creating demo comments...');
    await Comment.insertMany([
      {
        content:
          'Tested booking flow end-to-end with Jazz and Telenor numbers — OTP arrives within 15 seconds. Smooth UX. Moving to review.',
        author: dev1._id,
        entityType: 'task',
        entityId: tasks[0]._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'Great work Hamza! Verified in staging. Merging this to main today.',
        author: pm._id,
        entityType: 'task',
        entityId: tasks[0]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        content:
          'We need the distributed lock to auto-expire after 15 seconds in case the JazzCash API hangs indefinitely. Adding Redis Redlock to the fix.',
        author: dev2._id,
        entityType: 'bug',
        entityId: bugs[2]._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        content:
          'Agreed Hira. PR is up — using Redlock with a 15s TTL on the transaction mutex. Needs review before deploying to production.',
        author: dev3._id,
        entityType: 'bug',
        entityId: bugs[2]._id,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ]);

    logger.info('Creating demo notifications...');
    await Notification.insertMany([
      {
        recipient: dev1._id,
        sender: pm._id,
        title: 'Task Assigned',
        message: 'Ayesha Khan assigned task "Implement doctor availability calendar" to you',
        type: 'task_assigned',
        link: `/tasks/${tasks[2]._id}`,
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        recipient: dev2._id,
        sender: pm._id,
        title: 'Critical Bug Reported',
        message: 'JazzCash escrow double-debit on network timeout — marked Critical priority',
        type: 'bug_assigned',
        link: `/bugs/${bugs[2]._id}`,
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        recipient: dev3._id,
        sender: admin._id,
        title: 'Added to Project',
        message: 'Naveed Khan added you to project [KSN] KisanLink',
        type: 'member_added',
        link: `/projects/${project3._id}`,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        recipient: admin._id,
        sender: dev2._id,
        title: 'Bug Resolved',
        message: 'Hira Malik resolved bug "JWT token expiry causes silent dashboard freeze"',
        type: 'status_changed',
        link: `/bugs/${bugs[1]._id}`,
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ]);

    logger.info('Creating demo activity logs...');
    await ActivityLog.insertMany([
      {
        user: admin._id,
        action: 'created_project',
        details: 'Naveed Khan created project [SCT] SehatConnect',
        entityType: 'project',
        entityId: project1._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        user: pm._id,
        action: 'created_task',
        details: 'Ayesha Khan created task "Build patient appointment booking flow"',
        entityType: 'task',
        entityId: tasks[0]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: dev1._id,
        action: 'moved_task_status',
        details: 'Hamza Ahmed moved "Build patient appointment booking flow" to COMPLETED',
        entityType: 'task',
        entityId: tasks[0]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: dev3._id,
        action: 'reported_bug',
        details: 'Bilal Raza reported bug "OTP SMS delivery fails on Zong network numbers"',
        entityType: 'bug',
        entityId: bugs[0]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: dev2._id,
        action: 'resolved_bug',
        details: 'Hira Malik resolved bug "JWT token expiry causes silent dashboard freeze"',
        entityType: 'bug',
        entityId: bugs[1]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ]);

    logger.info('✅ DevTrack database seeded successfully with Pakistani startup data!');
    logger.info('-----------------------------------------------');
    logger.info('Demo Credentials:');
    logger.info('  Admin:           admin@devtrack.io  /  Admin123! (Naveed Khan)');
    logger.info('  Project Manager: pm@devtrack.io     /  Pm123!  (Ayesha Khan)');
    logger.info('  Developer 1:     dev1@devtrack.io   /  Dev123! (Hamza Ahmed)');
    logger.info('  Developer 2:     dev2@devtrack.io   /  Dev123! (Hira Malik)');
    logger.info('  Developer 3:     dev3@devtrack.io   /  Dev123! (Bilal Raza)');
    logger.info('-----------------------------------------------');
    logger.info('Projects seeded:');
    logger.info('  [SCT] SehatConnect       — Digital Healthcare Platform');
    logger.info('  [RZG] RozgarHub          — Skilled Worker Marketplace');
    logger.info('  [KSN] KisanLink          — AgriTech for Pakistani Farmers');
    logger.info('  [EDU] EduBridge          — Affordable Education Platform');
    logger.info('-----------------------------------------------');

    return true;
  } catch (error) {
    logger.error('Error during database seeding:', error.message);
    throw error;
  }
};

// If run directly from terminal via `npm run seed`
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      const { saveDatabaseSnapshot } = require('../services/persistenceService');
      await saveDatabaseSnapshot();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error('Seeder failed:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = { seedDatabase };
