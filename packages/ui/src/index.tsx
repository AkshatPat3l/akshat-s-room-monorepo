import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
    glass: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-xl"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export interface BentoCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  title, 
  description, 
  className = '', 
  children 
}) => {
  return (
    <div className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transition-all duration-500 hover:border-white/20 ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
        {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
};
