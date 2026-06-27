import React from 'react';
/* blueprint/import */import HobbyserversComponent from '@blueprint/extensions/hobbyservers/elements/BlockHobbyServersPluginEdit';import BudgetpropsComponent from '@blueprint/extensions/budgetprops/elements/BlockBudgetPropertiesEdit';import MctoolsComponent from '@blueprint/extensions/mctools/elements/EditorAddons';

export default () => {
  return (
    <>
      {/* blueprint/react */}<HobbyserversComponent /><BudgetpropsComponent /><MctoolsComponent />
    </>
  );
};
