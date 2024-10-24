const FILTERS_TEXT = "Active users\nPending invites\nRemoved users";
const FILTERS_CONTAINER_CLASS = "statusFilters--SMNEn98faE";
const CHECKBOX_CLASS = "ui-components-1qdwm9g";
const CHECKBOX_STATE_ATTRIBUTE_KEY = 'data-state'
const CHECKBOX_STATE_ATTRIBUTE_VALUE_WHEN_CHECKED = 'checked'
const NAVIGATION_CONTAINER_CLASS = "container--biH1xFvLjC";

function isFiltersOrderStillCorrect(filters) {
  return filters.innerText === FILTERS_TEXT;
}

function isCheckboxChecked(checkboxElement) {
  const checkedAttributeValue = checkboxElement.getAttribute(CHECKBOX_STATE_ATTRIBUTE_KEY);

  return CHECKBOX_STATE_ATTRIBUTE_VALUE_WHEN_CHECKED === checkedAttributeValue;
}

/**
 * Setup filters to 'Active users' only.
 */
function setupFilters() {
  const filterContainers = document.getElementsByClassName(
    FILTERS_CONTAINER_CLASS
  );
  if (filterContainers.length === 0) return;
  const filters = filterContainers[0];
  if (!isFiltersOrderStillCorrect(filters)) return;

  const checkboxCollection = filters.getElementsByClassName(
    CHECKBOX_CLASS
  );

  const activeUsersCheckbox = checkboxCollection[0];
  if (!isCheckboxChecked(activeUsersCheckbox)) {
    activeUsersCheckbox.click();
  }
  const pendingInvitesCheckbox = checkboxCollection[1];
  if (isCheckboxChecked(pendingInvitesCheckbox)) {
    pendingInvitesCheckbox.click();
  }
  const removedUsersCheckbox = checkboxCollection[2];
  if (isCheckboxChecked(removedUsersCheckbox)) {
    removedUsersCheckbox.click();
  }
}

function tryToNavigateToNextPage() {
  const navigationContainers = document.getElementsByClassName(
    NAVIGATION_CONTAINER_CLASS
  );
  if (navigationContainers.length === 0) {
    console.error("Could not locate the navigation buttons.");
    return false;
  }
  const topNavigation = navigationContainers[0];
  const nextPageButton = topNavigation.getElementsByTagName("button")[1];
  if (nextPageButton.disabled) {
    console.log("This was already last page.");
    return false;
  }
  nextPageButton.click();
  console.log("Navigated to next page.");
  return true;
}

function getCellsText(entry) {
  return entry.innerText
    .split("\t")
    .flatMap((el) => el.split("\n"))
    .flatMap((el) => (el !== "" ? el : []));
}

function scrapCurrentPageUsersInfo() {
  const [_tableHeader, ...entries] = document.getElementsByTagName("tr");
  const entriesTexts = entries.map(getCellsText);
  console.log(`Found info for ${entries.length} users on this page.`);
  return entriesTexts;
}

async function copyUsersToClipboard() {
  let usersInfo = [];
  let shouldScrapCurrentPage = true;
  do {
    usersInfo = usersInfo.concat(scrapCurrentPageUsersInfo());
    const couldNavigateToNextPage = tryToNavigateToNextPage();
    shouldScrapCurrentPage = couldNavigateToNextPage;
  } while (shouldScrapCurrentPage);

  const formattedEntries = usersInfo.map((e) => e.join("\t")).join("\n");

  await navigator.clipboard.writeText(formattedEntries);
  console.log(`Copied info for ${usersInfo.length} users`);
  return usersInfo.length;
}

function copyDataWhenFocused() {
  return new Promise((resolve, reject) => {
    const _asyncCopyFn = async () => {
      try {
        await copyUsersToClipboard();
        resolve();
      } catch (e) {
        reject(e);
      }
      window.removeEventListener("focus", _asyncCopyFn);
    };

    window.addEventListener("focus", _asyncCopyFn);
    console.info("Click back into Dashlane users page NOW!");
  });
}

setupFilters();
copyDataWhenFocused();
