import * as Insights from './insights';

// Check that each update UI follows the right conventions at least
function assertConformance(mod) {
  if(
    !('updateType' in mod) ||
    !('summaryCriteria' in mod) ||
    !('summaryView' in mod) ||
    !('fullView' in mod) ||
    !('addForm' in mod) ||
    !('editForm' in mod)
  ) {
    throw new Error(`${mod} is not valid - this should never happen`);
  }

  return mod;
}

/**
 * Each module exports a common set of attributes:
 *  - `updateType`: the type string
 *  - `summaryCriteria`: used to decide what to display on the summary view
 *  - `summaryView`: component used to render a single item in the summary
 *  - `fullView`: component used to render the update as a full page
 *  - `addForm`: component rendering an add form
 *  - `editForm`: component rendering an edit form
 */
export default {
  [Insights.updateType]: assertConformance(Insights),
};
