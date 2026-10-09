import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../common/Button';
import { formatRelativeTime } from '../../utils/dateUtils';
import { getInitials } from '../../utils/formatters';

const CommentThread = ({ entityType, entityId }) => {
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!entityId) return;
    try {
      setLoading(true);
      const res = await commentService.getComments(entityType, entityId);
      if (res?.data?.comments) {
        setComments(res.data.comments);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, error]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      const res = await commentService.createComment({
        content,
        entityType,
        entityId,
      });
      if (res?.data?.comment) {
        setComments((prev) => [...prev, res.data.comment]);
        setContent('');
        success('Comment posted');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      success('Comment removed');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <MessageSquare className="w-4 h-4 text-brand-500" />
        <span>Discussion ({comments.length})</span>
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {loading ? (
          <p role="status" className="p-4 text-center text-xs text-gray-400">
            Loading comments...
          </p>
        ) : comments.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
            No comments yet. Start the technical discussion below.
          </div>
        ) : (
          comments.map((comment) => {
            const isAuthor =
              comment.author?._id === user?._id || comment.author === user?._id;
            const canDelete = isAuthor || isAdmin;

            return (
              <div
                key={comment._id}
                className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/60 dark:bg-gray-900/30 text-xs transition-colors hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                      {getInitials(comment.author?.name)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 mr-2">
                        {comment.author?.name || 'User'}
                      </span>
                      {comment.author?.role && (
                        <span className="text-[10px] uppercase font-semibold text-gray-400">
                          {comment.author.role.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-gray-400 hover:text-rose-500 p-1 rounded transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pl-8">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Post Box */}
      <form onSubmit={handleSubmit} className="pt-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/30">
          <textarea
            rows="2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment or status update..."
            className="w-full p-3 text-xs bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <div className="px-3 py-2 bg-gray-50/70 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Send}
              isLoading={submitting}
              disabled={!content.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentThread;
