import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself


// Check for indexedDB support or exit!
if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

// Create a database called 'test-db5', version 1.
// Create a store with an auto incremental key.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db5', 1, (upgradeDb: idxdb.UpgradeDB) => {
    if (!upgradeDb.objectStoreNames.contains('store')) {
        let store = upgradeDb.createObjectStore('store', {keyPath: 'name', autoIncrement: true});
    }
});
// Adds an item to our store object
dbPromise.then((db: idxdb.DB): Promise<void> => {
    let tx: idxdb.Transaction = db.transaction('store', 'readwrite');
    let store: idxdb.ObjectStore = tx.objectStore('store');
    let item = {
        name: 'sandwich',
        price: 4.99,
        description: 'A very tasty sandwich',
        created: new Date().getTime()
    };

    store.add(item);
    return tx.complete;
}).then(() => {
    console.log(`added item to the store os!`);
}).catch((err: Error) => {
    console.log(`Couldn\'t add item to the store os!. ${err}`);
});

// Reads an item from our database
dbPromise.then((db: idxdb.DB) => {
    let tx: idxdb.Transaction = db.transaction('store', 'readonly');
    let store: idxdb.ObjectStore = tx.objectStore('store');
    return store.get('sandwich');
}).then((item: Object) => {
    console.log('The item from our database is:');
    console.dir(item);
}).catch((error: Error) => {
    console.error(`Could not retrieve item from database. ${error}`)
});

// Update an item from our database
dbPromise.then((db: idxdb.DB) => {
    let tx: idxdb.Transaction = db.transaction('store', 'readwrite');
    let store: idxdb.ObjectStore = tx.objectStore('store');
    var item = {
        name: 'sandwich', price: 99.99,
        description: 'A very tasty, but quite expensive, sandwich!',
        created: new Date().getTime()
    };
    store.put(item);
    return tx.complete;
}).then(() => {
    console.log('item updated!');
}).catch((error: Error) => {
    console.error(`Could not update the item. ${error}`);
});

// Deleting an item from our database
dbPromise.then((db: idxdb.DB) => {
    let tx: idxdb.Transaction = db.transaction('store', 'readwrite');
    let store: idxdb.ObjectStore = tx.objectStore('store');
    store.delete('sandwich');
    return tx.complete;
}).then(() => {
    console.log('Item deleted');
}).catch((error: Error) => {
    console.error(`Could not delete the item. ${error}`);
});
