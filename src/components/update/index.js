import Insights from './insights';
import Goals from './goals';
import Release from './release';
import Raid from './raid';

// Check that each update UI follows the right conventions at least
function assertConformance(mod) {
  if(
    !('updateType' in mod) ||
    !('title' in mod) ||
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
 * Each module exports an object with keys:
 *  - `updateType`: the type string
 *  - `title`: a string used to label the update type
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
  [Raid.updateType]: assertConformance(Raid),
};