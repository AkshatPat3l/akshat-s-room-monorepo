'use client';

import React from 'react';
import { ToggleLeft, ToggleRight, Sparkles, MonitorCheck } from 'lucide-react';
import { Button } from '@monorepo/ui';

interface NavigationProps {
  is3dDisabled: boolean;
  onToggle3d: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ is3dDisabled, onToggle3d }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600/20 p-2 rounded-xl border border-indigo-500/30">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-300 bg-clip-text text-transparent">
          AKSHAT'S ROOM
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Recruiter Scan Button */}
        <Button
          onClick={onToggle3d}
          variant="glass"
          className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase pl-3 pr-4 py-2 border border-white/10"
        >
          {is3dDisabled ? (
            <>
              <ToggleLeft className="w-5 h-5 text-zinc-500" />
              <span>Enable 3D View</span>
            </>
          ) : (
            <>
              <ToggleRight className="w-5 h-5 text-indigo-400" />
              <span className="text-zinc-300">Disable 3D View</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
};
export default Navigation;
