'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Cpu, Sparkles, Check, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { BentoCard, Button } from '@monorepo/ui';

interface BentoOverlaysProps {
  activeNodeId: string | null;
  onClose: () => void;
}

export const BentoOverlays: React.FC<BentoOverlaysProps> = ({ activeNodeId, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  // States for Bobba API Widget
  const [moderationText, setModerationText] = useState('This is a total SCAM with high spam content!');
  const [moderatedResult, setModeratedResult] = useState<any>(null);
  const [modLoading, setModLoading] = useState(false);
  const [modError, setModError] = useState('');

  // States for Marketplace API Widget
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    if (activeNodeId) {
      setIsOpen(true);
      // Reset errors and widget states
      setModeratedResult(null);
      setBookingResult(null);
      setBookingError('');
      setModError('');

      if (activeNodeId === 'marketplace') {
        fetchSlots();
      }
    } else {
      setIsOpen(false);
    }
  }, [activeNodeId]);

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await fetch('http://localhost:3002/api/v1/slots');
      if (!res.ok) throw new Error('Failed to load slots');
      const data = await res.json();
      setSlots(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleModerate = async () => {
    if (!moderationText.trim()) return;
    setModLoading(true);
    setModError('');
    setModeratedResult(null);

    try {
      const res = await fetch('http://localhost:3001/api/v1/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: moderationText }),
      });
      if (!res.ok) {
        throw new Error('Could not connect to Bobba API server.');
      }
      const data = await res.json();
      setModeratedResult(data);
    } catch (err: any) {
      setModError(err.message || 'Error occurred.');
    } finally {
      setModLoading(false);
    }
  };

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !customerName || !customerEmail) {
      setBookingError('Please fill out all booking fields.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingResult(null);

    try {
      const res = await fetch('http://localhost:3002/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: selectedSlotId,
          customerName,
          customerEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Double-booking transaction failed.');
      }
      setBookingResult(data);
      // Refresh slots listing
      fetchSlots();
    } catch (err: any) {
      setBookingError(err.message || 'Booking conflict occurred.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!activeNodeId || !isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-4 overflow-y-auto transition-all duration-300">
      <div className="w-full max-w-5xl glassmorphic rounded-3xl p-6 relative max-h-[90vh] overflow-y-auto border border-indigo-500/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all duration-300 active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        {/* --- INFOBUS COMPONENT --- */}
        {activeNodeId === 'infobus' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest">Architect Node</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mt-1">Infobus Architect Console</h2>
              <p className="text-zinc-400 mt-2">
                High-performance monorepo orchestration built on Turborepo, Next.js, and pnpm workspace sharing.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BentoCard title="Core Stack" className="md:col-span-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mt-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-indigo-400 font-extrabold text-xl">Turborepo</div>
                    <div className="text-xs text-zinc-500 mt-1">Build Caching</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-indigo-400 font-extrabold text-xl">PNPM</div>
                    <div className="text-xs text-zinc-500 mt-1">Shared Linkage</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-indigo-400 font-extrabold text-xl">TypeScript</div>
                    <div className="text-xs text-zinc-500 mt-1">Type Safety</div>
                  </div>
                </div>
              </BentoCard>

              <BentoCard title="Performance Stats">
                <div className="space-y-4 mt-2">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Pipeline Cache</span>
                    <span className="text-emerald-400 font-medium">98.2% Hit Rate</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Install Time</span>
                    <span className="text-emerald-400 font-medium">5.1s PNPM</span>
                  </div>
                </div>
              </BentoCard>

              <BentoCard title="Monorepo Visual Log" className="md:col-span-3">
                <div className="bg-black/50 font-mono text-xs p-4 rounded-xl border border-white/5 text-zinc-400 h-44 overflow-y-auto space-y-2">
                  <div>[turbo] <span className="text-indigo-400">@monorepo/types:build</span> cache hit, replayed outputs.</div>
                  <div>[turbo] <span className="text-indigo-400">@monorepo/database:build</span> cache hit, generated Client.</div>
                  <div>[fastify] <span className="text-blue-400">bobba-api</span> listening on port 3001.</div>
                  <div>[express] <span className="text-yellow-400">marketplace-api</span> listening on port 3002.</div>
                  <div>[next] <span className="text-purple-400">portfolio-client</span> compiled client successfully in 450ms.</div>
                  <div className="text-indigo-300 animate-pulse">&gt; Ready for developer auditing. Pipeline clean.</div>
                </div>
              </BentoCard>
            </div>
          </div>
        )}

        {/* --- SECURITY / BOBBA MODERATION COMPONENT --- */}
        {activeNodeId === 'security' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest">Security Terminal</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mt-1">Custom Trie Content Moderation</h2>
              <p className="text-zinc-400 mt-2">
                High-performance filtering engine inside `bobba-api` traversing characters linearly at $O(N)$ speed to filter spam keywords.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* API Widget */}
              <BentoCard title="Live Moderation Interactor" className="md:col-span-2">
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase font-medium">Input String Payload</label>
                    <textarea
                      value={moderationText}
                      onChange={(e) => setModerationText(e.target.value)}
                      className="w-full mt-1 bg-zinc-900/60 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-zinc-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleModerate} disabled={modLoading} variant="primary">
                      {modLoading ? 'Sanitizing...' : 'Test Trie Filtering'}
                    </Button>
                  </div>

                  {modError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2 bg-red-950/20 p-3 rounded-lg border border-red-500/10">
                      <AlertCircle className="w-4 h-4" />
                      <span>{modError} (Make sure bobba-api server is running!)</span>
                    </div>
                  )}

                  {moderatedResult && (
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3 mt-2 font-sans">
                      <div>
                        <div className="text-xs text-zinc-500">Sanitized Output (Spam swapped to [bobba])</div>
                        <div className="text-sm font-semibold text-emerald-300 mt-1">{moderatedResult.sanitized}</div>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                        <span className="text-zinc-500">Linear Scan Latency SLA</span>
                        <span className="text-indigo-400 font-mono font-bold">{moderatedResult.latencyMs.toFixed(4)} ms</span>
                      </div>
                    </div>
                  )}
                </div>
              </BentoCard>

              {/* Specs & Performance */}
              <BentoCard title="Trie Engine Specs">
                <div className="space-y-4 mt-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-zinc-500">Time Complexity</div>
                    <div className="text-xl font-bold text-white mt-1">O(N) Linear</div>
                    <div className="text-xs text-zinc-400 mt-1">N = length of text, fully independent of dictionary size.</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-zinc-500">Dictionary Scope</div>
                    <div className="text-xl font-bold text-white mt-1">Custom Prebuilt</div>
                    <div className="text-xs text-zinc-400 mt-1">Spam, scams, hacks, cheats, exploits, double-bookings.</div>
                  </div>
                </div>
              </BentoCard>
            </div>
          </div>
        )}

        {/* --- MARKETPLACE BOOKING COMPONENT --- */}
        {activeNodeId === 'marketplace' && (
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 text-yellow-400">
                <Cpu className="w-6 h-6 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-widest">Service Catalog Counter</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white mt-1">Concurrency-Safe Appointment System</h2>
              <p className="text-zinc-400 mt-2">
                Express booking platform protected by strict Prisma database `$transaction` isolation to prevent double-booking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* API Widget */}
              <BentoCard title="Live Slots Booker" className="md:col-span-2">
                <form onSubmit={handleBookSlot} className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-500 uppercase font-medium">Select Available Slot</label>
                    <button
                      type="button"
                      onClick={fetchSlots}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-all"
                      disabled={slotsLoading}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${slotsLoading ? 'animate-spin' : ''}`} />
                      Refresh Slots
                    </button>
                  </div>
                  
                  {slotsLoading ? (
                    <div className="text-sm text-zinc-500">Loading current availability...</div>
                  ) : slots.length === 0 ? (
                    <div className="text-sm text-red-400">No availability slots loaded. Start marketplace-api backend!</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1">
                      {slots.map((slot) => {
                        const isBooked = slot.status === 'BOOKED';
                        const startTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const date = new Date(slot.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
                        
                        return (
                          <div
                            key={slot.id}
                            onClick={() => !isBooked && setSelectedSlotId(slot.id)}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                              isBooked
                                ? 'bg-zinc-950/40 border-zinc-900/60 opacity-40 cursor-not-allowed'
                                : selectedSlotId === slot.id
                                ? 'bg-indigo-950/30 border-indigo-500 text-white'
                                : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                            }`}
                          >
                            <div className="text-xs font-semibold text-zinc-300">{slot.service.name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{date} @ {startTime}</span>
                            </div>
                            <div className="mt-2 text-[10px] font-bold tracking-widest uppercase">
                              {isBooked ? (
                                <span className="text-red-500">Booked</span>
                              ) : (
                                <span className="text-emerald-500">Available</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-medium">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full mt-1 bg-zinc-900/60 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 uppercase font-medium">Your Email</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full mt-1 bg-zinc-900/60 border border-white/10 rounded-xl p-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={bookingLoading || !selectedSlotId} variant="primary">
                    {bookingLoading ? 'Requesting transaction lock...' : 'Confirm Secure Booking'}
                  </Button>

                  {bookingError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mt-2 bg-red-950/20 p-3 rounded-lg border border-red-500/10">
                      <AlertCircle className="w-4 h-4" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  {bookingResult && (
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl space-y-2 mt-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                        <Check className="w-5 h-5" />
                        <span>{bookingResult.message}</span>
                      </div>
                      <div className="text-xs text-zinc-400 font-mono">
                        Booking ID: {bookingResult.booking.id}<br />
                        Slot: {bookingResult.booking.slotId}
                      </div>
                    </div>
                  )}
                </form>
              </BentoCard>

              {/* Transaction Mechanism Details */}
              <BentoCard title="Lock Mechanics">
                <div className="space-y-4 mt-2">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-xs text-zinc-500 font-semibold">Isolation Level</div>
                    <div className="text-lg font-bold text-white mt-1">Serializable-Equivalent</div>
                    <div className="text-xs text-zinc-400 mt-2">
                      Prisma's `$transaction` query isolation locks the slot row during processing, throwing immediate rollback conflicts to duplicate callers.
                    </div>
                  </div>
                </div>
              </BentoCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default BentoOverlays;
