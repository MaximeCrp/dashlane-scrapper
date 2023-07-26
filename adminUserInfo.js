const FILTERS_TEXT = "Active users\nPending invites\nRemoved users";
const FILTERS_CONTAINER_CLASS = "statusFilters--SMNEn98faE";
const CHECKED_CHECKBOX_CLASS = "checkboxChecked--vFOuF2l2VW";
const NAVIGATION_CONTAINER_CLASS = "container--biH1xFvLjC";
const DISABLED_LI_BUTTON_CLASS = "disabled--XMtY1YZUkS";

function isFiltersOrderStillCorrect(filters) {
  return filters.innerText === FILTERS_TEXT;
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
  const activeUsersFilter = filters.children[0];
  if (!activeUsersFilter.classList.contains(CHECKED_CHECKBOX_CLASS)) {
    activeUsersFilter.click();
  }
  const pendingInvitesFilter = filters.children[1];
  if (pendingInvitesFilter.classList.contains(CHECKED_CHECKBOX_CLASS)) {
    pendingInvitesFilter.click();
  }
  const removedUsersFilter = filters.children[2];
  if (removedUsersFilter.classList.contains(CHECKED_CHECKBOX_CLASS)) {
    removedUsersFilter.click();
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
  const nextPageButton = topNavigation.getElementsByTagName("li")[1];
  if (nextPageButton.classList.contains(DISABLED_LI_BUTTON_CLASS)) {
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
