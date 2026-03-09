const STORAGE_KEY = "ahmad_ipa_apps";
const storedApps = JSON.parse(localStorage.getItem(STORAGE_KEY));
const appData = storedApps && storedApps.length ? storedApps : apps;
