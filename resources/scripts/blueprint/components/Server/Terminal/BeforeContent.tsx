import React from 'react';
/* blueprint/import */import HobbyserversComponent from '@blueprint/extensions/hobbyservers/elements/ExternalServerRedirect';import BudgetidleComponent from '@blueprint/extensions/budgetidle/elements/BudgetIdleConsoleBanner';

export default () => {
  return (
    <>
      {/* blueprint/react */}<HobbyserversComponent /><BudgetidleComponent />
    </>
  );
};
