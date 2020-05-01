import Insights from './insights';
import Goals from './goals';
import Release from './release';

// Check that each update UI follows the right conventions at least
function assertConformance(mod) {
  if(
    !('updateType' in mod) ||
    !('SummaryView' in mod) ||
    !('FullView' in mod) ||
    !('AddForm' in mod) ||
    !('EditForm' in mod)
  ) {
    throw new Error(`${mod.updateType} is not valid - this should never happen`);
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
  [Goals.updateType]: assertConformance(Goals),
  [Release.updateType]: assertConformance(Release),
};