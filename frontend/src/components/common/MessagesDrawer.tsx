import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, AlertCircle, Info, ShieldAlert, Check } from 'lucide-react';
import { useMessages } from '../../hooks/useMessages';
import { AppMessage } from '../../services/messageService';

interface MessagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MessagesDrawer({ isOpen, onClose }: MessagesDrawerProps) {
  const { messages, unreadCount, sendMessage, markAsRead } = useMessages();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'ACTION_REQUIRED'>('ALL');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [isComposing, setIsComposing] = useState(false);

  const filtered = messages.filter((m) => {
    if (filter === 'UNREAD') return !m.read;
    if (filter === 'ACTION_REQUIRED') return m.type === 'ACTION_REQUIRED';
    return true;
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    await sendMessage({
      type: newPriority === 'CRITICAL' ? 'ALERT' : newPriority === 'HIGH' ? 'ACTION_REQUIRED' : 'INFO',
      title: newTitle,
      body: newBody,
      priority: newPriority,
      sender: 'Current Procurement Officer',
    });

    setNewTitle('');
    setNewBody('');
    setIsComposing(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
          />

          {/* Drawer Content */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">Procurement Messages</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {unreadCount} unread communication{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-header / Filters */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white text-xs">
              <div className="flex gap-1">
                {(['ALL', 'UNREAD', 'ACTION_REQUIRED'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      filter === tab
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab === 'ACTION_REQUIRED' ? 'Action Required' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsComposing(!isComposing)}
                className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800"
              >
                {isComposing ? 'Cancel' : '+ New'}
              </button>
            </div>

            {/* Compose form */}
            {isComposing && (
              <form onSubmit={handleSend} className="p-3.5 border-b border-indigo-100 bg-indigo-50/40 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Subject / Notice Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <textarea
                  placeholder="Message body..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16 resize-none"
                  required
                />
                <div className="flex items-center justify-between pt-1">
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-indigo-600 text-white rounded font-medium text-xs flex items-center gap-1.5 hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="w-3 h-3" /> Send
                  </button>
                </div>
              </form>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No messages in this view.
                </div>
              ) : (
                filtered.map((msg) => {
                  const isCritical = msg.priority === 'CRITICAL';
                  const isHigh = msg.priority === 'HIGH';

                  return (
                    <div
                      key={msg.id}
                      onClick={() => !msg.read && markAsRead(msg.id)}
                      className={`p-3 rounded-lg border transition-all text-xs cursor-pointer ${
                        !msg.read
                          ? 'bg-indigo-50/30 border-indigo-200 shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isCritical ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : isHigh ? (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span className={`font-semibold truncate ${!msg.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {msg.title}
                          </span>
                        </div>
                        {!msg.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {msg.body}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>{msg.sender}</span>
                        <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
