'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Notification } from '@/components/ui/Notification';
import { useLanguage } from '@/lib/LanguageContext';

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    companyName?: string;
  };
  receiverId: {
    _id: string;
    name: string;
    companyName?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function EmployerMessagesPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageType, setMessageType] = useState<'inbox' | 'sent'>('inbox');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<{ _id: string, name: string, expertise?: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newRecipient, setNewRecipient] = useState<{ _id: string, name: string, expertise?: string } | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/messages?type=${messageType}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch messages:', error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  }, [messageType]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await fetch(`/api/v1/candidates/search?skill=${searchTerm}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.candidates || []);
        }
      } catch (error: unknown) {
        console.error('Search failed:', error instanceof Error ? error.message : error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/v1/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isRead: true } : m));
    } catch (error: unknown) {
      console.error('Failed to mark message as read:', error instanceof Error ? error.message : error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm(t('messages.confirm_delete'))) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/v1/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: t('messages.delete_success') });
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setSelectedMessage(null);
      } else {
        const data = await response.json();
        setNotification({ type: 'error', message: data.error || t('messages.error_delete') });
      }
    } catch (error: unknown) {
      console.error('Failed to delete message:', error instanceof Error ? error.message : error);
      setNotification({ type: 'error', message: t('messages.error_delete') });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsCreating(false);
    if (messageType === 'inbox' && !message.isRead) {
      markAsRead(message._id);
    }
    setReplyContent('');
  };

  const handleSendMessage = async (isNew = false) => {
    const content = replyContent.trim();
    if (!content) return;

    let receiverId = '';
    if (isNew) {
      if (!newRecipient) return;
      receiverId = newRecipient._id;
    } else {
      if (!selectedMessage) return;
      receiverId = messageType === 'inbox' 
        ? selectedMessage.senderId._id 
        : selectedMessage.receiverId._id;
    }

    setIsSending(true);
    try {
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId,
          content,
        }),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: t('messages.send_success') });
        setReplyContent('');
        if (isNew) {
          setIsCreating(false);
          setNewRecipient(null);
          setSearchTerm('');
          fetchMessages();
        }
      } else {
        const data = await response.json();
        setNotification({ type: 'error', message: data.error || t('messages.error_send') });
      }
    } catch (error: unknown) {
      console.error('Failed to send message:', error instanceof Error ? error.message : error);
      setNotification({ type: 'error', message: t('messages.error_unexpected') });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
        {/* Messages List */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{t('messages.mailbox')}</h1>
              <Button 
                variant="primary" 
                size="sm" 
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg shadow-sm cursor-pointer"
                onClick={() => { setIsCreating(true); setSelectedMessage(null); }}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('messages.new message')}
              </Button>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button 
                className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${messageType === 'inbox' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#0066FF]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => { setMessageType('inbox'); setSelectedMessage(null); }}
              >
                {t('messages.inbox')}
              </button>
              <button 
                className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${messageType === 'sent' ? 'bg-white dark:bg-gray-700 shadow-sm text-[#0066FF]' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => { setMessageType('sent'); setSelectedMessage(null); }}
              >
                {t('messages.sent')}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  {messageType === 'inbox' ? t('messages.no_inbox') : t('messages.no_sent')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <Card 
                  key={message._id} 
                  hover 
                  className={`cursor-pointer transition-all ${selectedMessage?._id === message._id ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : ''} ${messageType === 'inbox' && !message.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm truncate pr-2">
                        {messageType === 'sent' 
                          ? `${t('messages.to')}${message.receiverId?.name || t('messages.candidate')}`
                          : (message.senderId?.name || t('messages.candidate'))}
                      </span>
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 flex-1">
                        {message.content}
                      </p>
                      {messageType === 'inbox' && !message.isRead && (
                        <div className="w-2 h-2 bg-[#0066FF] rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail / Creation */}
        <div className="flex-1 flex flex-col">
          {isCreating ? (
            <Card className="flex-1 flex flex-col shadow-xl overflow-hidden border-[#0066FF]/20">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{t('messages.new message')}</CardTitle>
                  <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-8 flex-1 bg-white dark:bg-gray-950 space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">
                      {t('messages.recipient')}
                    </label>
                    {newRecipient ? (
                      <div className="flex items-center justify-between p-3 bg-[#0066FF]/5 dark:bg-[#0066FF]/10 rounded-xl border border-[#0066FF]/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0066FF] flex items-center justify-center text-white font-bold text-xs">
                            {newRecipient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{newRecipient.name}</p>
                            <p className="text-xs text-gray-500">{newRecipient.expertise || t('messages.candidate')}</p>
                          </div>
                        </div>
                        <button onClick={() => setNewRecipient(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
                          {t('messages.close')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-[#0066FF] outline-none transition-all placeholder:text-gray-400"
                          placeholder={t('messages.search_candidate')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {isSearching && (
                          <div className="absolute right-4 top-[3.25rem]">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0066FF]"></div>
                          </div>
                        )}
                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                            {searchResults.map((user) => (
                              <button
                                key={user._id}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0 flex items-center gap-3 transition-colors cursor-pointer"
                                onClick={() => { setNewRecipient(user); setSearchResults([]); setSearchTerm(''); }}
                              >
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-xs">
                                  {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.expertise || t('messages.candidate')}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 block">
                      {t('messages.content')}
                    </label>
                    <Textarea
                      className="min-h-[200px] rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 focus:border-[#0066FF] outline-none transition-all resize-none"
                      placeholder={t('messages.reply_placeholder')}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-gray-500 cursor-pointer text-xs md:text-sm">
                  {t('messages.cancel')}
                </Button>
                <Button 
                  variant="primary"
                  className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] px-8 h-10 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer text-xs md:text-sm"
                  disabled={!newRecipient || !replyContent.trim() || isSending}
                  onClick={() => handleSendMessage(true)}
                  isLoading={isSending}
                >
                  {t('messages.send_reply')}
                </Button>
              </div>
            </Card>
          ) : selectedMessage ? (
            <Card className="flex-1 flex flex-col shadow-xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-base md:text-lg">
                        {messageType === 'sent' 
                          ? selectedMessage.receiverId?.name 
                          : selectedMessage.senderId?.name}
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm">
                        {messageType === 'sent' ? t('messages.recipient') : t('messages.sender')}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-4">
                    <button 
                      onClick={() => handleDelete(selectedMessage._id)}
                      disabled={isDeleting}
                      className="p-1.5 md:p-2 text-gray-400 hover:text-red-500 transition-colors bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
                      title={t('messages.delete_tooltip')}
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                      <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDateTime(selectedMessage.createdAt)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-8 overflow-y-auto flex-1 bg-white dark:bg-gray-950">
                <div className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base text-gray-800 dark:text-gray-200">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>
              </CardContent>
              {messageType === 'inbox' && (
                <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t('messages.your_reply')}</label>
                    </div>
                    <Textarea 
                      placeholder={t('messages.reply_placeholder')}
                      className="min-h-[100px] md:min-h-[120px] rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 focus:ring-[#0066FF] focus:border-[#0066FF] resize-none text-sm md:text-base"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      disabled={isSending}
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="ghost" onClick={() => setSelectedMessage(null)} className="text-gray-500 cursor-pointer text-xs md:text-sm">
                        {t('messages.close')}
                      </Button>
                      <Button 
                        variant="primary" 
                        className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] px-4 md:px-8 h-9 md:h-10 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 text-xs md:text-sm"
                        onClick={() => handleSendMessage()}
                        disabled={!replyContent.trim() || isSending}
                        isLoading={isSending}
                      >
                        {t('messages.send_reply')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-900/10">
              <div className="w-16 h-16 mb-4 opacity-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{t('messages.select_message')}</p>
              <Button 
                variant="outline" 
                className="mt-4 border-[#0066FF] text-[#0066FF] hover:bg-[#0066FF] hover:text-white cursor-pointer px-6"
                onClick={() => setIsCreating(true)}
              >
                {t('messages.new message')}
              </Button>
            </div>
          )}
        </div>
      </div>
      {notification && (
        <Notification
          isOpen={!!notification}
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
