import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself


// Check for indexedDB support or exit!
if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

// Create a database called 'test-db2', version 1.
// Inside our callback function, upgradeDb,
// create an Object Store (or table) called 'firstOS' only if
// if doesn't exist already.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db2', 1, (upgradeDb: idxdb.UpgradeDB) => {
    console.log('making a new object store');
    if (!upgradeDb.objectStoreNames.contains('firstOS')) {
        upgradeDb.createObjectStore('firstOS');
    }
});
