import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  Server,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { bugService } from '../../services/bugService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BugModal from '../../components/bugs/BugModal';
import CommentThread from '../../components/comments/CommentThread';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';
import { formatStatus, getInitials } from '../../utils/formatters';

const BugDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBugDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bugService.getBug(id);
      if (res?.data?.bug) {
        setBug(res.data.bug);
        setResolutionNotes(res.data.bug.resolutionNotes || '');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load bug details');
      navigate('/bugs');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, error]);

  useEffect(() => {
    fetchBugDetails();
  }, [fetchBugDetails]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await bugService.updateBug(bug._id, { status: newStatus });
      setBug((prev) => ({ ...prev, status: newStatus }));
      success(`Bug status changed to ${formatStatus(newStatus)}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update bug status');
    }
  };

  const handleSaveResolutionNotes = async () => {
    try {
      setSavingNotes(true);
      await bugService.updateBug(bug._id, { resolutionNotes });
      setBug((prev) => ({ ...prev, resolutionNotes }));
      success('Resolution notes saved');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save resolution notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await bugService.deleteBug(bug._id);
      success('Bug report deleted');
      navigate('/bugs');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete bug report');
    } finally {
      setActionLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return <Loader message="Loading defect analysis..." className="py-20" />;
  }

  if (!bug) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link
          to="/bugs"
          className="hover:text-brand-500 flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Bug Tracker
        </Link>
        <span>/</span>
        <span className="font-mono text-brand-500">[{bug.project?.key}]</span>
        <span className="truncate">{bug.title}</span>
      </div>

      {/* Defect Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {bug.project?.key}
            </span>
            <Badge type="severity" variant={bug.severity} size="sm" />
            <Badge type="priority" variant={bug.priority} size="sm" />
            <span className="text-xs text-gray-400">
              Reported {formatRelativeTime(bug.createdAt)}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {bug.title}
          </h1>
        </div>

        {/* Status Dropdown & Action Controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Status:</span>
            <select
              value={bug.status}
              onChange={handleStatusChange}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="reopened">Reopened</option>
            </select>
          </div>

          {(isManager || isAdmin) && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Steps, Comparison, Resolution Notes, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Defect Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {bug.description}
              </div>
            </CardContent>
          </Card>

          {/* Steps to Reproduce */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileCode className="w-4 h-4 text-brand-500" />
                Steps to Reproduce
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bug.stepsToReproduce ? (
                <pre className="font-mono text-xs bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {bug.stepsToReproduce}
                </pre>
              ) : (
                <p className="text-xs text-gray-400 italic">No steps to reproduce recorded.</p>
              )}
            </CardContent>
          </Card>

          {/* Expected vs Actual Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Expected Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {bug.expectedResult || 'Not specified.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xs flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                  Actual Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {bug.actualResult || 'Not specified.'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Resolution Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Resolution Notes / Root Cause</CardTitle>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveResolutionNotes}
                isLoading={savingNotes}
              >
                Save Notes
              </Button>
            </CardHeader>
            <CardContent>
              <textarea
                rows="3"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document patch details, git commit reference, or root cause analysis..."
                className="w-full text-xs p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </CardContent>
          </Card>

          {/* Threaded Discussion */}
          <Card className="p-6">
            <CommentThread entityType="bug" entityId={bug._id} />
          </Card>
        </div>

        {/* Right 1 Col: Metadata Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Defect Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Project */}
              <div>
                <span className="text-gray-400 block mb-1">Project</span>
                <Link
                  to={`/projects/${bug.project?._id}`}
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  [{bug.project?.key}] {bug.project?.name}
                </Link>
              </div>

              {/* Environment */}
              <div>
                <span className="text-gray-400 block mb-1">Environment</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-gray-400" />
                  {bug.environment || 'Production'}
                </span>
              </div>

              {/* Assigned Developer */}
              <div>
                <span className="text-gray-400 block mb-1">Assigned Developer</span>
                {bug.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[10px] flex items-center justify-center">
                      {getInitials(bug.assignedTo.name)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {bug.assignedTo.name}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {bug.assignedTo.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Unassigned</span>
                )}
              </div>

              {/* Reporter */}
              <div>
                <span className="text-gray-400 block mb-1">Reported By</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-[10px] flex items-center justify-center">
                    {getInitials(bug.reportedBy?.name)}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {bug.reportedBy?.name}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {formatDate(bug.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Bug Modal */}
      <BugModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchBugDetails}
        bug={bug}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Defect Report?"
        message={`Are you sure you want to delete "${bug.title}"?`}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default BugDetailsPage;
