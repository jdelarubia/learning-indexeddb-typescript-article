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

// Adds an item to our store object
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

retrieve_all_items();

// Delete one of the items
dbPromise.then((db) => {
    let tx = db.transaction('foods', 'readwrite');
    let store = tx.objectStore('foods');
    store.delete('ice cream');
    return tx.complete;
});

retrieve_all_items();

function retrieve_all_items() {
    // Console out all items from our 'foods' table
    dbPromise.then((db: idxdb.DB): Promise<Object[]> => {
        let tx: idxdb.Transaction = db.transaction('foods', 'readonly');
        let store: idxdb.ObjectStore = tx.objectStore('foods');
        return store.getAll();
    }).then((items) => {
        console.log('List of items');
        items.forEach((item) => {
            console.log(item);
        });
    });
}
