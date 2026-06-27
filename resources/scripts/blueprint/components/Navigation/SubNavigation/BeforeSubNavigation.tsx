import React from 'react';
import { useLocation } from 'react-router-dom';

export default () => {
  const { pathname } = useLocation();

  // Server header requires ServerContext — only render on server pages, not /account.
  if (!pathname.startsWith('/server/')) {
    return null;
  }

  return (
    <>
      {/* blueprint/react */}
    </>
  );
};
