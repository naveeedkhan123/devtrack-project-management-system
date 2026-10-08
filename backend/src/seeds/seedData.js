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
    // Demo users (passwords will be hashed by UserSchema pre-save)
    const admin = await User.create({
      name: 'Alex Morgan',
      email: 'admin@devtrack.io',
      password: 'Admin123!',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      bio: 'Head of Engineering & System Administrator. Overseeing enterprise infrastructure, DevOps, and team workflows.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const pm = await User.create({
      name: 'Sarah Jenkins',
      email: 'pm@devtrack.io',
      password: 'Pm123!',
      role: 'project_manager',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      bio: 'Lead Technical Project Manager. Specializing in Agile Scrum, sprint velocity optimization, and milestone delivery.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const dev1 = await User.create({
      name: 'David Chen',
      email: 'dev1@devtrack.io',
      password: 'Dev123!',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      bio: 'Senior Frontend Engineer. React, TypeScript, Tailwind CSS, and accessible UI enthusiast.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const dev2 = await User.create({
      name: 'Elena Rostova',
      email: 'dev2@devtrack.io',
      password: 'Dev123!',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      bio: 'Backend & Cloud Systems Architect. Node.js, distributed databases, event streams, and security.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    const dev3 = await User.create({
      name: 'Marcus Vance',
      email: 'dev3@devtrack.io',
      password: 'Dev123!',
      role: 'developer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      bio: 'Fullstack Software Engineer. API design, automated test pipelines, and real-time data sync.',
      status: 'active',
      preferences: { theme: 'dark', emailNotifications: true },
    });

    logger.info('Creating demo projects...');
    const project1 = await Project.create({
      name: 'DevTrack Cloud 2.0',
      key: 'DTC',
      description: 'Next-generation enterprise agile development and defect tracking platform with real-time Kanban and telemetry.',
      status: 'active',
      priority: 'high',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      manager: pm._id,
      members: [pm._id, dev1._id, dev2._id, dev3._id],
      createdBy: admin._id,
    });

    const project2 = await Project.create({
      name: 'FinTech Payment Gateway',
      key: 'PAY',
      description: 'Ultra-low latency PCI-DSS Level 1 compliant payments pipeline supporting multi-currency routing and fraud prevention.',
      status: 'active',
      priority: 'critical',
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      manager: pm._id,
      members: [pm._id, dev2._id, dev3._id],
      createdBy: pm._id,
    });

    const project3 = await Project.create({
      name: 'Mobile Banking App v3.4',
      key: 'MOB',
      description: 'Cross-platform mobile banking revamp with biometric authentication, offline synchronization, and instant card locking.',
      status: 'planning',
      priority: 'medium',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      manager: admin._id,
      members: [admin._id, dev1._id, dev3._id],
      createdBy: admin._id,
    });

    const project4 = await Project.create({
      name: 'Legacy PHP Monolith Migration',
      key: 'MIG',
      description: 'Decommissioning legacy monolith codebase into modular microservices deployed onto Kubernetes clusters.',
      status: 'completed',
      priority: 'high',
      startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      manager: pm._id,
      members: [pm._id, dev2._id],
      createdBy: admin._id,
    });

    logger.info('Creating demo tasks across Kanban columns...');
    const tasks = await Task.insertMany([
      // DTC Project Tasks
      {
        title: 'Build drag-and-drop Kanban board engine',
        description: 'Implement fluid drag-and-drop card movements across TODO, IN PROGRESS, REVIEW, and COMPLETED columns using dnd-kit.',
        project: project1._id,
        assignedTo: dev1._id,
        createdBy: pm._id,
        priority: 'high',
        status: 'completed',
        order: 0,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'Kanban', 'UI'],
        commentsCount: 2,
      },
      {
        title: 'Design JWT authentication & RBAC middleware',
        description: 'Secure all REST endpoints with Bearer token authentication and role authorization checks for Admin, PM, and Developer.',
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
        title: 'Build interactive executive analytics dashboard',
        description: 'Display task completion trends, project velocity, and bug severity charts using Recharts.',
        project: project1._id,
        assignedTo: dev1._id,
        createdBy: pm._id,
        priority: 'high',
        status: 'in_progress',
        order: 0,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'Analytics', 'Charts'],
        commentsCount: 3,
      },
      {
        title: 'Implement in-app notification dropdown system',
        description: 'Provide real-time bell icon badge and notification dropdown for task assignments and status updates.',
        project: project1._id,
        assignedTo: dev3._id,
        createdBy: pm._id,
        priority: 'medium',
        status: 'review',
        order: 0,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'UX', 'Notifications'],
        commentsCount: 0,
      },
      {
        title: 'Write automated Jest integration test suite',
        description: 'Cover auth routes, RBAC permission checks, project management, and task status patch endpoints.',
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
        title: 'Audit accessibility (a11y) and keyboard navigation',
        description: 'Ensure modal focus traps, ARIA attributes on dropdowns, and high contrast compliant palette.',
        project: project1._id,
        assignedTo: dev1._id,
        createdBy: pm._id,
        priority: 'low',
        status: 'todo',
        order: 1,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        labels: ['Frontend', 'A11y'],
        commentsCount: 0,
      },

      // PAY Project Tasks
      {
        title: 'Idempotency-Key request header deduplication',
        description: 'Store idempotency keys in Redis/DB with 24hr TTL to guarantee payment charges are executed exactly once.',
        project: project2._id,
        assignedTo: dev2._id,
        createdBy: pm._id,
        priority: 'critical',
        status: 'in_progress',
        order: 0,
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'Payment', 'Reliability'],
        commentsCount: 1,
      },
      {
        title: 'Implement 3D Secure 2.0 challenge authentication flow',
        description: 'Handle friction-free and challenge flows for European PSD2 SCA compliance.',
        project: project2._id,
        assignedTo: dev3._id,
        createdBy: pm._id,
        priority: 'critical',
        status: 'todo',
        order: 0,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        labels: ['Compliance', 'Frontend', 'Payment'],
        commentsCount: 0,
      },
      {
        title: 'Currency exchange rate real-time sync service',
        description: 'Connect to European Central Bank rate feed and cache converted values with 1-hour expiry.',
        project: project2._id,
        assignedTo: dev2._id,
        createdBy: pm._id,
        priority: 'medium',
        status: 'review',
        order: 0,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        labels: ['Backend', 'API', 'Rates'],
        commentsCount: 0,
      },

      // MOB Project Tasks
      {
        title: 'Integrate Biometric FaceID/Fingerprint authentication',
        description: 'Allow instant biometric unlock with hardware keystore secure enclave fallback.',
        project: project3._id,
        assignedTo: dev3._id,
        createdBy: admin._id,
        priority: 'high',
        status: 'todo',
        order: 0,
        dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        labels: ['Mobile', 'Security', 'iOS', 'Android'],
        commentsCount: 0,
      },
    ]);

    logger.info('Creating demo bugs...');
    const bugs = await Bug.insertMany([
      {
        title: 'Drag-and-drop card position flickers on Safari during Kanban drop',
        description: 'When dragging a task card from IN PROGRESS to REVIEW, the drop placeholder exhibits a 200ms repositioning flicker on WebKit browsers.',
        project: project1._id,
        reportedBy: dev3._id,
        assignedTo: dev1._id,
        severity: 'medium',
        priority: 'high',
        status: 'in_progress',
        environment: 'Staging / Safari 17.2',
        stepsToReproduce: '1. Navigate to Project Kanban board\n2. Pick up card with mouse drag\n3. Hover over REVIEW column header\n4. Release cursor',
        expectedResult: 'Smooth drop animation with immediate position snapping without jitter.',
        actualResult: 'Card drops into column, but previous column flashes ghost card for one frame.',
        resolutionNotes: 'Currently testing collisionDetection algorithm switch from closestCenter to pointerWithin.',
        commentsCount: 2,
      },
      {
        title: 'Expired JWT token causes silent 401 unhandled rejection',
        description: 'When the token expires after 7 days, background fetch requests fail silently without redirecting the user to /login.',
        project: project1._id,
        reportedBy: dev1._id,
        assignedTo: dev2._id,
        severity: 'high',
        priority: 'critical',
        status: 'resolved',
        environment: 'Production',
        stepsToReproduce: '1. Set token expired in localStorage\n2. Refresh page or trigger dashboard stats query',
        expectedResult: 'Axios response interceptor catches 401, clears auth session and routes to login page with notice.',
        actualResult: 'Dashboard shows endless loading skeleton.',
        resolutionNotes: 'Resolved: Attached Axios global interceptor in api.js to purge token and redirect to /login?session=expired.',
        commentsCount: 1,
      },
      {
        title: 'Payment webhook retry storm triggers duplicate ledger entries',
        description: 'When payment gateway times out after 10 seconds, external webhook retries hit the server concurrently before the first transaction lock finishes.',
        project: project2._id,
        reportedBy: pm._id,
        assignedTo: dev2._id,
        severity: 'critical',
        priority: 'critical',
        status: 'open',
        environment: 'Production',
        stepsToReproduce: '1. Send mock Stripe webhook event evt_10928\n2. Delay response by 12s to simulate slow DB write\n3. Gateway sends duplicate webhook after 5s\n4. Check ledger table for duplicate charges',
        expectedResult: 'Distributed atomic mutex rejects secondary duplicate webhook immediately.',
        actualResult: 'Two separate ledger lines recorded with same charge ID.',
        resolutionNotes: '',
        commentsCount: 3,
      },
      {
        title: 'Zero-decimal currency rounding error in JPY transactions',
        description: 'Japanese Yen transactions were being divided by 100, causing 5000 JPY to be recorded as 50 JPY.',
        project: project2._id,
        reportedBy: dev2._id,
        assignedTo: dev2._id,
        severity: 'high',
        priority: 'critical',
        status: 'resolved',
        environment: 'Staging',
        stepsToReproduce: '1. Submit payment for 5000 JPY\n2. Inspect database record amount field',
        expectedResult: 'Amount is 5000',
        actualResult: 'Amount is 50',
        resolutionNotes: 'Resolved: Added zero-decimal currency list check in currency formatter utility before applying cents divisor.',
        commentsCount: 0,
      },
      {
        title: 'Android 14 cold start crash on deep link parsing',
        description: 'When opening app from external push notification link while app is terminated, null pointer exception is thrown in deep link router.',
        project: project3._id,
        reportedBy: dev3._id,
        assignedTo: dev3._id,
        severity: 'critical',
        priority: 'high',
        status: 'open',
        environment: 'QA / Android 14',
        stepsToReproduce: '1. Kill app process\n2. Send push with uri devtrack://projects/123\n3. Tap notification banner',
        expectedResult: 'App launches and navigates to target project',
        actualResult: 'App terminates immediately with signal 9',
        resolutionNotes: '',
        commentsCount: 0,
      },
    ]);

    logger.info('Creating demo comments...');
    await Comment.insertMany([
      {
        content: 'I have tested the dnd-kit pointer sensors. The drag gestures feel very responsive on touch screens now.',
        author: dev1._id,
        entityType: 'task',
        entityId: tasks[0]._id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'Looks awesome David! Merged and verified in staging.',
        author: pm._id,
        entityType: 'task',
        entityId: tasks[0]._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'We need to make sure the distributed lock has a 15-second auto-expiry in case the node crashes mid-transaction.',
        author: dev2._id,
        entityType: 'bug',
        entityId: bugs[2]._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        content: 'Agreed. Adding Redis Redlock pattern to the PR this afternoon.',
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
        message: 'Sarah Jenkins assigned task "Build interactive executive analytics dashboard" to you',
        type: 'task_assigned',
        link: `/tasks/${tasks[2]._id}`,
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        recipient: dev2._id,
        sender: pm._id,
        title: 'Critical Bug Reported',
        message: 'Payment webhook retry storm triggers duplicate ledger entries',
        type: 'bug_assigned',
        link: `/bugs/${bugs[2]._id}`,
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        recipient: dev3._id,
        sender: admin._id,
        title: 'Added to Project',
        message: 'Alex Morgan added you to project [MOB] Mobile Banking App v3.4',
        type: 'member_added',
        link: `/projects/${project3._id}`,
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        recipient: admin._id,
        sender: dev2._id,
        title: 'Bug Resolved',
        message: 'Elena Rostova resolved bug "Expired JWT token causes silent 401 unhandled rejection"',
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
        details: 'Alex Morgan created project [DTC] DevTrack Cloud 2.0',
        entityType: 'project',
        entityId: project1._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        user: pm._id,
        action: 'created_task',
        details: 'Sarah Jenkins created task "Build drag-and-drop Kanban board engine"',
        entityType: 'task',
        entityId: tasks[0]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        user: dev1._id,
        action: 'moved_task_status',
        details: 'David Chen moved "Build drag-and-drop Kanban board engine" to COMPLETED',
        entityType: 'task',
        entityId: tasks[0]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        user: dev3._id,
        action: 'reported_bug',
        details: 'Marcus Vance reported bug "Drag-and-drop card position flickers on Safari"',
        entityType: 'bug',
        entityId: bugs[0]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: dev2._id,
        action: 'resolved_bug',
        details: 'Elena Rostova resolved bug "Expired JWT token causes silent 401 unhandled rejection"',
        entityType: 'bug',
        entityId: bugs[1]._id,
        project: project1._id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ]);

    logger.info('✅ DevTrack database seeded successfully!');
    logger.info('-----------------------------------------------');
    logger.info('Demo Credentials:');
    logger.info('  Admin:           admin@devtrack.io  /  Admin123!');
    logger.info('  Project Manager: pm@devtrack.io     /  Pm123!');
    logger.info('  Developer 1:     dev1@devtrack.io   /  Dev123!');
    logger.info('  Developer 2:     dev2@devtrack.io   /  Dev123!');
    logger.info('  Developer 3:     dev3@devtrack.io   /  Dev123!');
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
