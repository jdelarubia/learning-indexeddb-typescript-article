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

// Main process
let dbPromise: Promise<idxdb.DB> = create_db();
init_db(dbPromise);

// Create a database called 'test-db7', version 3.
function create_db(): Promise<idxdb.DB> {

    let dbPromise: Promise<idxdb.DB> = idb.open('test-db7', 3, (upgradeDb: idxdb.UpgradeDB) => {
        switch (upgradeDb.oldVersion) {
            case 0:
            if (!upgradeDb.objectStoreNames.contains('foods')) {
                upgradeDb.createObjectStore('foods', {keyPath: 'menu'});
            }
            case 1:
            var store = upgradeDb.transaction.objectStore('foods');
            store.createIndex('price', 'price', {unique: false});
            case 3:
            var store = upgradeDb.transaction.objectStore('foods');
            store.createIndex('description', 'description', {unique: false});
        }
    });
    return dbPromise;
}

// Adds a few items to our store object
function init_db(dbPromise: Promise<idxdb.DB>) {

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
}

