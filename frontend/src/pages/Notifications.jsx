import React from 'react';
import { useNotifications } from '../hooks/notifications/useNotifications';

const BellIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function Notifications() {
  const { data: notifications = [], isLoading, isError } = useNotifications();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100">
        Une erreur est survenue lors du chargement des notifications.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Mes Notifications</h1>
        <p className="text-slate-500 mt-1">Consultez vos derniers messages et alertes.</p>
      </header>

      <div className="bg-white rounded-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-5 transition-colors hover:bg-slate-50 flex gap-4 ${
                  !notification.is_read ? 'bg-red-50/30' : ''
                }`}
              >
                <div className="mt-1">
                  {!notification.is_read ? <BellIcon /> : <CheckIcon />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-sm ${!notification.is_read ? 'font-bold text-slate-800' : 'font-semibold text-slate-600'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {new Date(notification.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {notification.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <CheckIcon />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Tout est à jour !</h3>
              <p className="text-sm text-slate-500">Vous n'avez aucune notification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
