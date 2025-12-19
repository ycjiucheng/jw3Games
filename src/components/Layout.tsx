import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-jx3-bg font-serif text-jx3-ink flex flex-col items-center py-8 px-4 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]">
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-md shadow-xl rounded-lg border-2 border-jx3-primary p-6 min-h-[80vh] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-jx3-primary opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-jx3-primary opacity-50"></div>
        {children}
      </div>
    </div>
  );
};
