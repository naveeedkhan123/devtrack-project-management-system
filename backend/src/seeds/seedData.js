const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const { connectDB, disconnectDB } = require('../config/db');
const logger = require('../utils/logger');

// Additive/idempotent demo catalog. Existing customer records are never purged.
const ensure = async (Model, query, record) => {
  const found = await Model.findOne(query);
  return found || Model.create(record);
};

const seedDatabase = async () => {
  try {
    const admin = await ensure(User, { email: 'admin@devtrack.io' }, { name: 'Naveed Khan', email: 'admin@devtrack.io', password: 'Admin123!Strong', role: 'admin', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', bio: 'Head of Engineering & System Administrator at DevTrack.', status: 'active', preferences: { theme: 'dark', emailNotifications: true } });
    const pm = await ensure(User, { email: 'pm@devtrack.io' }, { name: 'Ayesha Khan', email: 'pm@devtrack.io', password: 'Pm123!Strong', role: 'project_manager', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200', bio: 'Technical Project Manager specialising in delivery and agile planning.', status: 'active' });
    const dev1 = await ensure(User, { email: 'dev1@devtrack.io' }, { name: 'Hamza Ahmed', email: 'dev1@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', bio: 'Senior frontend engineer focused on accessible product experiences.', status: 'active' });
    const dev2 = await ensure(User, { email: 'dev2@devtrack.io' }, { name: 'Hira Malik', email: 'dev2@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', bio: 'Backend and cloud systems engineer specialising in secure APIs.', status: 'active' });
    const dev3 = await ensure(User, { email: 'dev3@devtrack.io' }, { name: 'Bilal Raza', email: 'dev3@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', bio: 'Full-stack engineer focused on reliable integrations and testing.', status: 'active' });
    const dev4 = await ensure(User, { email: 'dev4@devtrack.io' }, { name: 'Maham Siddiqui', email: 'dev4@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=240', bio: 'Product designer and frontend engineer building inclusive, mobile-first workflows.', status: 'active' });
    const dev5 = await ensure(User, { email: 'dev5@devtrack.io' }, { name: 'Usman Tariq', email: 'dev5@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=240', bio: 'Platform engineer specialising in observability, integrations, and performance.', status: 'active' });
    const dev6 = await ensure(User, { email: 'dev6@devtrack.io' }, { name: 'Zoya Iqbal', email: 'dev6@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=240', bio: 'QA automation engineer focused on resilient releases and accessibility.', status: 'active' });
    const dev7 = await ensure(User, { email: 'dev7@devtrack.io' }, { name: 'Saad Mahmood', email: 'dev7@devtrack.io', password: 'Dev123!Strong', role: 'developer', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=240', bio: 'Data and backend engineer working on search, analytics, and civic platforms.', status: 'active' });

    const specs = [
      ['SehatConnect', 'SCT', 'Digital healthcare appointments, e-prescriptions, and medical records for urban and rural Pakistan.', 'active', 'high', pm, [pm, dev1, dev2, dev3]],
      ['RozgarHub', 'RZG', 'A verified marketplace connecting skilled Pakistani workers with nearby employers.', 'active', 'high', pm, [pm, dev2, dev3, dev5]],
      ['KisanLink', 'KSN', 'A farmer marketplace with mandi prices, weather alerts, and direct-to-buyer listings.', 'planning', 'medium', admin, [admin, dev1, dev3, dev7]],
      ['EduBridge', 'EDU', 'Low-bandwidth scholarship, course, and mentorship discovery for Pakistani students.', 'completed', 'medium', pm, [pm, dev2, dev6]],
      ['FloodRelief', 'FRS', 'Emergency response coordination for flood-affected communities, volunteers, shelters, and relief inventory.', 'active', 'critical', admin, [admin, pm, dev4, dev5, dev6]],
      ['RaastaSafe', 'RSS', 'Smart traffic reporting and road-safety insights for Karachi, Lahore, Islamabad, and Peshawar.', 'active', 'high', pm, [pm, dev1, dev5, dev7]],
      ['MarhamNow', 'MHS', 'A digital healthcare appointment and teleconsultation service designed for low-bandwidth Pakistani communities.', 'planning', 'high', pm, [pm, dev1, dev2, dev6]],
      ['KisanBazaar', 'KMB', 'A fair, mobile-first marketplace helping farmers sell produce directly to local buyers.', 'planning', 'high', admin, [admin, dev3, dev4, dev7]],
      ['ScholarTrack', 'STF', 'A searchable scholarship finder with eligibility matching and deadline reminders.', 'active', 'medium', pm, [pm, dev2, dev6]],
      ['Hunarmand', 'HSM', 'A local jobs and skills marketplace with verified profiles, training paths, and mobile-wallet payouts.', 'active', 'high', pm, [pm, dev2, dev5, dev6]],
      ['SafaiShehar', 'SSR', 'Waste collection routing, citizen pickup requests, and recycling partner management.', 'planning', 'medium', admin, [admin, dev1, dev4, dev7]],
      ['BijliSuno', 'BSP', 'Utility bill visibility and electricity complaint tracking for households and small businesses.', 'on_hold', 'critical', admin, [admin, pm, dev3, dev5, dev6]],
    ];
    const projects = {};
    for (const [name, key, description, status, priority, manager, members] of specs) {
      projects[key] = await ensure(Project, { key }, { name, key, description, status, priority, startDate: new Date(Date.now() - 20 * 86400000), deadline: new Date(Date.now() + (status === 'completed' ? -5 : 45) * 86400000), manager: manager._id, members: members.map((member) => member._id), createdBy: admin._id });
    }

    const tasks = [
      ['FRS', 'Shelter availability and capacity map', 'Connect district shelter feeds and show live capacity for relief coordinators.', dev4, 'high', 'in_progress'], ['FRS', 'Relief inventory reconciliation', 'Track food, medicine, tents, and dispatch status by warehouse.', dev5, 'critical', 'todo'],
      ['RSS', 'Incident report intake flow', 'Allow citizens to report hazards with location, photo, and severity.', dev1, 'high', 'review'], ['RSS', 'Road closure data adapter', 'Normalise traffic feeds and publish verified road closures.', dev7, 'critical', 'todo'],
      ['MHS', 'Appointment slot discovery', 'Build a low-bandwidth doctor search and appointment confirmation flow.', dev1, 'high', 'in_progress'], ['MHS', 'Teleconsultation consent record', 'Store consent and visit metadata before a video consultation begins.', dev2, 'critical', 'todo'],
      ['KMB', 'Farmer listing and buyer offers', 'Create listing, offer, and order confirmation flows for produce.', dev3, 'high', 'in_progress'], ['KMB', 'Mandi price comparison cards', 'Show current price ranges by district and crop.', dev4, 'medium', 'todo'],
      ['STF', 'Eligibility questionnaire', 'Match students to scholarships using education, region, and income criteria.', dev2, 'high', 'completed'], ['STF', 'Deadline reminder service', 'Send email and in-app reminders before scholarship closing dates.', dev6, 'medium', 'in_progress'],
      ['HSM', 'Verified skills profile', 'Build skill evidence, ratings, and verification badges for workers.', dev5, 'critical', 'review'], ['HSM', 'Mobile wallet payout ledger', 'Track Easypaisa and JazzCash payout status with idempotency keys.', dev2, 'critical', 'todo'],
      ['SSR', 'Pickup request workflow', 'Create citizen pickup requests and route them to collection teams.', dev1, 'high', 'todo'], ['SSR', 'Recycling partner dashboard', 'Report collected weight by material and partner.', dev7, 'medium', 'todo'],
      ['BSP', 'Bill lookup and history', 'Present bill history and due-date alerts for supported providers.', dev3, 'high', 'todo'], ['BSP', 'Complaint escalation timeline', 'Track complaint references, SLAs, and escalation evidence.', dev6, 'critical', 'in_progress'],
    ];
    for (const [key, title, description, assignee, priority, status] of tasks) await ensure(Task, { project: projects[key]._id, title }, { title, description, project: projects[key]._id, assignedTo: assignee._id, createdBy: pm._id, priority, status, dueDate: new Date(Date.now() + 14 * 86400000), labels: ['Pakistan', 'CivicTech'] });

    const bugs = [
      ['FRS', 'Offline shelter sync duplicates a relief centre', 'Duplicate shelter records appear after reconnecting from low bandwidth.', dev6, dev5, 'high', 'open'], ['RSS', 'Traffic incident pin drifts on map zoom', 'Reported road hazard markers move on mobile after zooming.', dev1, dev7, 'medium', 'in_progress'],
      ['MHS', 'Doctor availability is missing on the next day boundary', 'Late-night appointment searches can omit the first morning slot.', dev1, dev2, 'high', 'open'],
      ['KMB', 'Offer total rounds incorrectly for kilogram pricing', 'Decimal produce quantities produce a one-rupee mismatch at checkout.', dev4, dev3, 'high', 'open'], ['STF', 'Scholarship closing date uses browser timezone', 'Students in Pakistan see the deadline one day early in some browsers.', dev6, dev2, 'medium', 'resolved'],
      ['HSM', 'Payout retry can create duplicate ledger entry', 'A wallet timeout followed by a webhook retry can record the same payout twice.', pm, dev5, 'critical', 'open'], ['SSR', 'Pickup route excludes apartment address notes', 'Collection notes are dropped when a request is assigned to a route.', dev1, dev4, 'medium', 'in_progress'],
      ['BSP', 'Complaint attachment fails above 5MB', 'Large utility bill evidence files return a generic server error.', dev6, dev3, 'high', 'open'], ['BSP', 'Bill provider timeout leaves spinner active', 'A slow provider response never transitions the lookup view to an error state.', dev3, dev6, 'medium', 'resolved'],
    ];
    for (const [key, title, description, reporter, assignee, severity, status] of bugs) await ensure(Bug, { project: projects[key]._id, title }, { title, description, project: projects[key]._id, reportedBy: reporter._id, assignedTo: assignee._id, severity, priority: severity, status, environment: 'Staging', expectedResult: 'The workflow completes with a clear result or recoverable error.', actualResult: 'The current workflow is inconsistent under the described condition.' });

    logger.info('DevTrack additive seed complete: 9 users, 12 projects, civic-tech tasks and bugs reconciled.');
    return { users: 9, projects: 12 };
  } catch (error) { logger.error('Error during database seeding:', error.message); throw error; }
};

if (require.main === module) (async () => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_SEED !== 'true') {
      throw new Error('Demo seeding is disabled in production. Set ALLOW_DEMO_SEED=true to override.');
    }
    await connectDB();
    const { restoreDatabaseSnapshot, saveDatabaseSnapshot } = require('../services/persistenceService');
    await restoreDatabaseSnapshot();
    await seedDatabase();
    await saveDatabaseSnapshot();
    await disconnectDB();
    process.exit(0);
  } catch (err) { logger.error('Seeder failed:', err.message); process.exit(1); }
})();

module.exports = { seedDatabase };
