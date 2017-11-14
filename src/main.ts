import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself


// Check for indexedDB support or exit!
if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

// Create a database called 'test-db3', version 1.
// Create 3 different store object each with different options.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db3', 1, (upgradeDb: idxdb.UpgradeDB) => {
    let tables = [
        {tableNname: 'people', options: {keyPath: 'email'}},
        {tableNname: 'notes', options: {autoIncrement: true}},
        {tableNname: 'logs', options: {keyPath: 'id', autoIncrement: true}}
    ]
    tables.forEach((table) => {
        // Check if the object store exists already.
        if (!upgradeDb.objectStoreNames.contains(table.tableNname)) {
            upgradeDb.createObjectStore(table.tableNname, table.options);
        }
    });
});
