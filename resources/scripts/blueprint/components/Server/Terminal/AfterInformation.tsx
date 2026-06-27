import React from 'react';
/* blueprint/import */import HobbyserversComponent from '@blueprint/extensions/hobbyservers/elements/ServerRatingStat';import BudgetidleComponent from '@blueprint/extensions/budgetidle/elements/BudgetIdleConsoleStat';

export default () => {
  return (
    <>
      {/* blueprint/react */}<HobbyserversComponent /><BudgetidleComponent />
    </>
  );
};
