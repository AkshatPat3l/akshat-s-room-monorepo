'use client';

import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import ThreeCanvas from '../components/ThreeCanvas';
import BentoOverlays from '../components/BentoOverlays';
import { BentoCard } from '@monorepo/ui';
import { Sparkles, Terminal, Cpu, Calendar, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [is3dDisabled, setIs3dDisabled] = useState(false);

  const handleFurnitureSelect = (nodeId: string) => {
    setActiveNodeId(nodeId);
  };

  const handleCloseOverlay = () => {
    setActiveNodeId(null);
  };

  return (
    <main className="min-h-screen bg-[#0b0f19] flex flex-col text-zinc-100 selection:bg-indigo-600/40 select-none">
      {/* Navigation Sticky Header */}
      <Navigation is3dDisabled={is3dDisabled} onToggle3d={() => setIs3dDisabled(!is3dDisabled)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative min-h-[calc(100vh-76px)]">
        {!is3dDisabled ? (
          /* --- ACTIVE 3D ISOMETRIC CLIENT --- */
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {/* Guide overlay */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none max-w-sm glassmorphic p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">3D Interactive Mode</span>
              </div>
              <h1 className="text-lg font-bold text-white leading-tight">Click to Walk & Explore</h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Click any floor tile to move the avatar. Click on furniture modules to guide the avatar next to it and audit live backend systems.
              </p>
            </div>

            {/* Render 3D Canvas Mesh */}
            <div className="flex-1 w-full min-h-[70vh] bg-gradient-to-b from-[#0c1221] to-[#080b13]">
              <ThreeCanvas
                onFurnitureSelect={handleFurnitureSelect}
                activeNodeId={activeNodeId}
              />
            </div>

            {/* Footer labels */}
            <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-blue-950/40 text-blue-400 border border-blue-500/20">Blue: Infobus</span>
              <span className="px-2.5 py-1 rounded-full bg-red-950/40 text-red-400 border border-red-500/20">Red: Security Terminal</span>
              <span className="px-2.5 py-1 rounded-full bg-yellow-950/40 text-yellow-400 border border-yellow-500/20">Gold: Marketplace</span>
            </div>

            {/* Event triggerable overlays */}
            <BentoOverlays activeNodeId={activeNodeId} onClose={handleCloseOverlay} />
          </div>
        ) : (
          /* --- RECRUITER SAFEGUARD FALLBACK STANDARD PORTFOLIO --- */
          <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8 animate-fadeIn">
            <div className="max-w-2xl">
              <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Recruiter Scanning Safeguard (WebGL Safely Unmounted)</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight mt-2">
                System Catalog Portfolio
              </h1>
              <p className="text-zinc-400 mt-3 text-base leading-relaxed">
                A highly-optimized system architecture demonstrating parallel multi-tier applications linked via a pnpm Turborepo monorepo.
              </p>
            </div>

            {/* Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Project 1 Bento Card */}
              <BentoCard
                title="1. Infobus Architecture"
                description="Turborepo monorepo structural linkages"
                className="md:col-span-2"
              >
                <div className="mt-2 text-sm text-zinc-300 space-y-3 leading-relaxed">
                  <p>
                    Orchestrated a standardized monorepo using <strong>Turborepo</strong> and <strong>pnpm workspace sharing</strong>. Centralizes package dependencies, shares schema bindings, and compiles global configs automatically.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Next.js</span>
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Turborepo</span>
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">pnpm workspaces</span>
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Tailwind CSS</span>
                  </div>
                </div>
              </BentoCard>

              {/* Status card */}
              <BentoCard title="Pipeline Status">
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Fastify REST API</span>
                    <span className="text-emerald-400 font-medium">Healthy [3001]</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Express Booking API</span>
                    <span className="text-emerald-400 font-medium">Healthy [3002]</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Prisma Client</span>
                    <span className="text-emerald-400 font-medium">Connected (SQLite)</span>
                  </div>
                </div>
              </BentoCard>

              {/* Project 2 Bento Card */}
              <BentoCard
                title="2. Trie Content Moderation"
                description="High-Speed linear matching algorithms"
              >
                <div className="mt-2 text-sm text-zinc-300 space-y-3 leading-relaxed">
                  <p>
                    Built a fast text moderator inside <strong>Fastify</strong> using a custom <strong>Trie (Prefix Tree)</strong> data structure to replace toxic terms in $O(N)$ linear scan latency.
                  </p>
                  <div className="pt-2 font-mono text-xs text-indigo-400">
                    SLA SLA Limit: &lt; 5.0ms
                  </div>
                </div>
              </BentoCard>

              {/* Project 3 Bento Card */}
              <BentoCard
                title="3. Concurrency Booking Database"
                description="Database transactions slot isolation locks"
                className="md:col-span-2"
              >
                <div className="mt-2 text-sm text-zinc-300 space-y-3 leading-relaxed">
                  <p>
                    Created a normalized Prisma booking calendar service in <strong>Express</strong>. Employs atomic database transaction allocations to guarantee race-condition safety, fully preventing double-bookings.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Express.js</span>
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Prisma</span>
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Database Locks</span>
                    <span className="bg-zinc-800 text-zinc-200 text-xs px-2.5 py-1 rounded-lg border border-zinc-700">Concurrency Tested</span>
                  </div>
                </div>
              </BentoCard>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}
