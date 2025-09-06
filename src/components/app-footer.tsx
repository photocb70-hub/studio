
'use client';

import React, { useState, useEffect } from 'react';

export function AppFooter({ version, children }: { version: string, children?: React.ReactNode }) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="mt-12 flex flex-col items-center justify-center text-center text-sm text-muted-foreground">
        <div>
            {year !== null ? (
                <p>© {year} Optical Prime. All Rights Reserved.</p>
            ) : (
                <p>&nbsp;</p> 
            )}
            {version && <p className="mt-1 opacity-75">Version {version}</p>}
        </div>
        {children && <div className="mt-2">{children}</div>}
    </footer>
  );
}
