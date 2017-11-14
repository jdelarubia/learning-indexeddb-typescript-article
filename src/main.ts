import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself


// Check for indexedDB support or exit!
if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

// Create a database called 'test-db4', version 1.
// Create 3 different store object each with different options and different indexes.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db4', 1, (upgradeDb: idxdb.UpgradeDB) => {
    let people = {tableName: 'people', options: {keyPath: 'email'}};
    let notes = {tableName: 'notes', options: {autoIncrement: true}};
    let logs = {tableName: 'logs', options: {keyPath: 'id', autoIncrement: true}};
    
    if (!upgradeDb.objectStoreNames.contains(people.tableName)) {
        let peopleOS: idxdb.ObjectStore = upgradeDb.createObjectStore(people.tableName, people.options);
        peopleOS.createIndex('gender', 'gender', {unique: false});
        peopleOS.createIndex('ssn', 'ssn', {unique: true});
    }

    if (!upgradeDb.objectStoreNames.contains(notes.tableName)) {
        let notesOS: idxdb.ObjectStore = upgradeDb.createObjectStore(notes.tableName, notes.options);
        notesOS.createIndex('title', 'title', {unique: false});
    }

    if (!upgradeDb.objectStoreNames.contains(people.tableName)) {
        let logsOS: idxdb.ObjectStore = upgradeDb.createObjectStore(logs.tableName, logs.options);
    }
});
