import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself


// Check for indexedDB support or exit!
if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

let db_items = [
    {
        menu: 'sandwich', price: 4.99,
        description: 'A very tasty sandwich',
        created: new Date().getTime()
    },
    {
        menu: 'ice cream', price: 3.99,
        description: 'Double ice cream with toppings',
        created: new Date().getTime()
    },
    {
        menu: 'hamburger', price: 2.99,
        description: 'Beefburger with salad and cheese',
        created: new Date().getTime()
    },
    {
        menu: 'pizza', price: 3.50,
        description: 'Vegetal pizza',
        created: new Date().getTime()
    }
];

// Create a database called 'test-db6', version 1.
// Create a store using name as a key.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db6', 1, (upgradeDb: idxdb.UpgradeDB) => {
    if (!upgradeDb.objectStoreNames.contains('foods')) {
        let store = upgradeDb.createObjectStore('foods', {keyPath: 'menu'});
    }
});

// Adds a few items to our store object
dbPromise.then((db: idxdb.DB): Promise<void> => {
    let tx: idxdb.Transaction = db.transaction('foods', 'readwrite');
    let store: idxdb.ObjectStore = tx.objectStore('foods');
    db_items.forEach((item) => {
        store.add(item);
    });
    return tx.complete;
}).then(() => {
    console.log(`items added to the table!`);
}).catch((err: Error) => {
    console.log(`Couldn\'t add items to the table!. ${err}`);
});

dbPromise.then((db: idxdb.DB): Promise<idxdb.Cursor> => {
    let tx: idxdb.Transaction = db.transaction('foods', 'readonly');
    let store: idxdb.ObjectStore = tx.objectStore('foods');
    return store.openCursor();
}).then(function logItems (cursor: idxdb.Cursor): Promise<idxdb.Cursor>|any {
    if (!cursor) return;
    console.log(`Cursored at: ${cursor.key}`);
    for (let field in cursor.value) {
        console.log(cursor.value[field]);
    }
    return cursor.continue().then(logItems);
}).then(() => {
    console.log('Done cursoring');
});
