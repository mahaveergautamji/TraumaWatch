import React, { useState } from 'react';
import { X, PhoneCall, CheckCircle2, HeartHandshake, ShieldCheck, Send } from 'lucide-react';

interface CounsellorContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedCounsellor: string;
  survivorId: string;
}

export const CounsellorContactModal: React.FC<CounsellorContactModalProps> = ({
  isOpen,
  onClose,
  assignedCounsellor,
  survivorId,
}) => {
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const [preferredContact, setPreferredContact] = useState<'call' | 'in_person' | 'sms'>('call');
  const [userNote, setUserNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSendRequest = () => {
    setRequestSent(true);
  };

  const handleClose = () => {
    setRequestSent(false);
    setUserNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-teal-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Connect With Your Counsellor
              </h2>
              <p className="text-xs text-slate-500">
                You are never alone on heavier days
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {requestSent ? (
            <div className="py-6 flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Check-in Request Received
              </h3>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Your request has been routed privately to <span className="font-semibold text-slate-800">{assignedCounsellor}</span>. A team member will reach out via your preferred method shortly.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left w-full text-xs text-slate-600 mt-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Privacy Safeguard</span>
                </div>
                <span>Your identity ({survivorId}) remains protected by end-to-end tokenisation. Only clinical care teams have authorized dispatch access.</span>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your assigned support professional is <span className="font-semibold text-slate-800">{assignedCounsellor}</span>. Reaching out does not mean anything is wrong — it is a proactive step when waves feel heavy.
                </p>
              </div>

              {/* Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  How would you prefer to connect?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'call', label: 'Audio Call' },
                    { id: 'in_person', label: 'In-person' },
                    { id: 'sms', label: 'Silent SMS' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreferredContact(opt.id as any)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                        preferredContact === opt.id
                          ? 'bg-teal-50 border-teal-500 text-teal-800 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Anything you want them to know first? <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <textarea
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="e.g. Having hard nights after loud noises this week..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 text-slate-800 placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleSendRequest}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Gentle Check-in Ping</span>
              </button>

              {/* Immediate 24/7 Helplines */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Immediate 24/7 Crisis Support (Toll-Free)
                </p>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Tele-MANAS (Govt of India)</span>
                      <span className="text-[11px] text-slate-500">24/7 Multi-lingual psychological support</span>
                    </div>
                    <a
                      href="tel:14416"
                      className="flex items-center gap-1 text-teal-700 font-mono font-bold hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> 14416
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block">Kiran Helpline</span>
                      <span className="text-[11px] text-slate-500">National Mental Health Hotline</span>
                    </div>
                    <a
                      href="tel:18005990019"
                      className="flex items-center gap-1 text-teal-700 font-mono font-bold hover:underline"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> 1800-599-0019
                    </a>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            {requestSent ? 'Done' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
