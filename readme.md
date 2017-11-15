# Working with IndexedDB, in Typescript

This is a little tutorial based on the excellent tutorial from Google Developers, [Working with IndexedDB](https://developers.google.com/web/ilt/pwa/working-with-indexeddb), using [Jake Archibald's IDB Javascript library](https://github.com/jakearchibald/idb), but leveraging Typescript type hinting.

## TOC

[Project Setup](#project-setup)

[00 Setting up your html](#00-setting-up-your-html)

[01 Opening a database](#01-opening-a-database)

[02 Create object stores](#02-create-object-stores)

[03 Defining primary keys](#03-defining-primary-keys)

[04 Defining indexes](#04-defining-indexes)

[05 Creating data](#05-creating-data)

[06 Reading data](#06-reading-data)

[07 Updating data](#07-updating-data)

[08 Deleting data](#08-deleting-data)

[09 Getting all the data](#09-getting-all-the-data)

[10 Using cursors](#10-using-cursors)




## Project setup

- Create a new directory to be the root of your project.
- Inside this directory, create 2 more directories: *js* and *src*.
- Create 2 empty (for now) files. */index.html* and */src/main.ts*
- Download [requirejs.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/requirejs/index.d.ts) inside your *src* directory. **This is not strictly required though**.
- Download [requirejs.min.js](http://requirejs.org/docs/release/2.3.5/minified/require.js) inside your *js* directory.
- Download [idb.d.ts](https://github.com/jakearchibald/idb/blob/master/lib/idb.d.ts) into your *src* directory
- Download [idb.js](https://github.com/jakearchibald/idb/blob/master/lib/idb.js) into your *js* directory.
- Run: ```tsc --init``` inside of your root project directory.
- Check the basic parameters in tsconfig.json just created are as follows:

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "amd",
    "sourceMap": true, // not relevant if you don't plan to debug
    "outDir": "./js",
    "rootDir": "./src",
    "strict": true
  }
}
```

So far, your project structure should look like this.

```bash
<project-root-dir>/
|
+- js/
|  +- idb.js
|  +- require.min.js
|
+- src/
|  +- main.ts
|  +- idb.d.ts
|  +- require.d.ts
|
+- index.html
```

## 00 Setting up your html

Let's prepare your */index.html* for basic use.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IndexedDB Tests</title>
</head>
<body>

<script src="./js/require.min.js" data-main="./js/main.js"></script>

</body>
</html>
```

It doesn't do much, just load requirejs and points to our main application file to be generated next.

[toc](#toc)

## 01 Opening a database

On your */src/main.ts*, type in the following code.

```javascript
import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself

// Check for indexedDB support or exit!
if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

let dbPromise: Promise<idxdb.DB> = idb.open('test-db1', 1);
```

Now it's time to compile your *main.ts*.

If everything went alright, you will not see any errors on your compilation, so open *index.html* on your browser (Chrome is my choice for this).

### Experience nothingness

The page is blank so to check that it worked open *Developer Tools* and go to the *Application* tab. One of the labels on the left reads *IndexedDB*, right-click on it and then *Refresh IndexedDB*. Now you see that *test-db1* has been created. Our first *IndexedDB* database.

[toc](#toc)

## 02 Create object stores

Edit your */src/main.ts* to look as follows.

```javascript
import * as idxdb from "./idb"; // Type hinting idb.d.ts
import "./js/idb.js";           // idb object itself

if (!('indexedDB' in window)) {
    throw new Error('Your browser doesn\'t support indexedDB');
}

// Create a database called 'test-db2', version 1.
// Adds an object store called 'firstOS' in open's callback.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db2', 1, (upgradeDb: idxdb.UpgradeDB) => {
    console.log('making a new object store');
    if (!upgradeDb.objectStoreNames.contains('firstOS')) {
        upgradeDb.createObjectStore('firstOS');
    }
});
```

First, ```open()``` returns a *Promise* that resolves in a *DB* object. We store this *Promise* in a variable for later use.

We make use of the third parameter of ```open()``` which is a callback *UpgradeDB* object that is used for creating object stores.

Open your index.html, developer tools, Application/IndexedDB, Refresh IndexedDB and check the new store created.

[toc](#toc)

## 03 Defining primary keys

Edit your */src/main.ts* once again.

```javascript
// ... setup and check for indexeddb support ...

let dbPromise: Promise<idxdb.DB> = idb.open('test-db3', 1, (upgradeDb: idxdb.UpgradeDB) => {
    let tables = [
        {name: 'people', options: {keyPath: 'email'}},
        {name: 'notes', options: {autoIncrement: true}},
        {name: 'logs', options: {keyPath: 'id', autoIncrement: true}}
    ]
    tables.forEach((table) => {
        // Check if the object store exists already.
        if (!upgradeDb.objectStoreNames.contains(table.name)) {
            upgradeDb.createObjectStore(table.name, table.options);
        }
    });
});
```

For each of the object stores (or tables), it checks whether it exists already and, if it doesn't, creates it.

Open your index.html, developer tools, Application/IndexedDB, Refresh IndexedDB and check how the three stores have been created.

[toc](#toc)

## 04 Defining indexes

Let's crete a few indexes inside our upgradeDB callback. Indexes are special objects dependent on our stores, so we'll have to tweak the code from the last section a bit.

```javascript
// ... setup and check for indexeddb support ...

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
```

This code will create 2 indexes for our *people* object store, 1 for our *notes* store and none for the *logs* store.

Open *index.html* and *developer tools*, *Aplication/IndexedDB*, Refresh IndexedDB. Check how the *test-db4* database has been created and it contains all the indexes we added earlier.

[toc](#toc)

## 05 Creating data

We'll edit */src/main.ts* to rearrange our code as follows.

```javascript
// ... setup and check for indexeddb support ...

// Create a database called 'test-db5', version 1.
// Create a store with an auto incremental key.
let dbPromise: Promise<idxdb.DB> = idb.open('test-db5', 1, (upgradeDb: idxdb.UpgradeDB) => {
    if (!upgradeDb.objectStoreNames.contains('store')) {
        let store = upgradeDb.createObjectStore('store', {autoIncrement: true});
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
```

First we create the *database* with a storage object conviniently called 'store'.

On the second chunk of code, once the database is solid, remember we created it as a *Promise*, then we create a transaction, get a reference to our store and add an object to it.

We add our item to the database, we use the method ```.add()``` on the store object we want to add it on.

Every operation is wrapped up in a transaction. If one of the operations fail, the whole transaction rolls back and our addition never happens.

```.catch()``` is there to have some information prompted out if the transaction fails. For testing, just try mispelling the name of the store object. Change the line ```let store = tx.objectStore('stroe');``` and look at the error message on the Console.

[toc](#toc)

## 06 Reading data

We'll edit our */src/main.ts* to show as follows.

```javascript
// ... setup and check for indexeddb support ...

let dbPromise: Promise<idxdb.DB> = idb.open('test-db5', 1, (upgradeDb: idxdb.UpgradeDB) => {
    if (!upgradeDb.objectStoreNames.contains('store')) {
        let store = upgradeDb.createObjectStore('store', {keyPath: 'name', autoIncrement: true});
    }
});

// Add an item to our database
dbPromise.then((db: idxdb.DB): Promise<void> => {
    let tx: idxdb.Transaction = db.transaction('store', 'readwrite');
    let store: idxdb.ObjectStore = tx.objectStore('store');
    let item = {
        name: 'sandwich', price: 4.99, description: 'A very tasty sandwich',
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
});
```

The ```.get()``` method returns a *Promise* that give us either the item retrieved from the database or *undefined* if it could not find it.

[toc](#toc)

## 07 Updating data

We update an item in our database by calling the ```.put()``` method passing our item with the changes we want to make.

```javascript
// ... setup and check for indexeddb support ...
// ... open our database ...
// ... create the item ...
// ... read the item ...

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
});
```

Compile the code and open *index.html* on your browse. If everything wen alright, you should see a few messages on the console and our item updated in our indexedDB database.

[toc](#toc)

## 08 Deleting data

Next up, let's delete our just updated item from our database. Again, edit */src/main.ts*.

```javascript
// ... setup and check for indexeddb support ...
// ... open our database ...
// ... create the item ...
// ... read the item ...
// ... update the item ...

// Deleting an item from our database
dbPromise.then((db: idxdb.DB) => {
    let tx: idxdb.Transaction = db.transaction('store', 'readwrite');
    let store: idxdb.ObjectStore = tx.objectStore('store');
    store.delete('sandwich');
    return tx.complete;
}).then(() => {
    console.log('Item deleted');
});
```

We need to pass on the *key* of the item that we want deleted to the ```.delete()``` method.

Open *index.html* and check the results on the *developer tools*. The database should show no records if everything wen alright.

[toc](#toc)

## 09 Getting all the data

Edit your */src/main.ts* to look like my code. Note that I have changed the name of the table and added a few things for testing.

```javascript
// ... setup and check for indexeddb support ...

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
```

We retrieve all the items of our database by using ```.getAll()``` method.

This time, I have wrapped up the code in a function I can reuse. So, for example, I add up a few items, print the content of the table, delete one o the item and finally print everything out again.

[toc](#toc)

## 10 Using cursors

Edit, once again, our */src/main.ts*.

```javascript
// ... setup and check for indexeddb support ...
// ... open our database ...
// ... fill in our table from the previous section ...

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
```

We start by opening a transaction and returning a Promise which will resolve to a *Cursor* which is an object pointing to the current item in the database.

Note the named function which allows us to call it from inside the body of ```.then()```. The line, ```if (!cursor) return; ``` will break this loop.

Open your *index.html* and *developer tools* to see the logs on the console and the table at *Application/IndexedDB*. Remember to *Refresh IndexedDB to see the table (object store).

[toc](#toc)
