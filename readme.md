# Working with IndexedDB, in Typescript

This is a little tutorial based on the excellent tutorial from Google Developers, [Working with IndexedDB](https://developers.google.com/web/ilt/pwa/working-with-indexeddb), using [Jake Archibald's IDB Javascript library](https://github.com/jakearchibald/idb), but leveraging Typescript type hinting.

## TOC

[Project Setup](#project-setup)

[00 Setting up your html](#00-setting-up-your-html)

[01 Opening a database](#01-opening-a-database)

[02 Create object stores](#02-create-object-stores)

[03 Defining primary keys](#03-defining-primary-keys)

[04 Defining indexes](#04-defining-indexes)


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

Every operation is wrapped up in a transaction. If one of the operations fail, the whole transaction rolls back and our addition never happens.

```.catch()``` is there to have some information prompted out if the transaction fails. For testing, just try mispelling the name of the store object. Change the line ```let store = tx.objectStore('stroe');``` and look at the error message on the Console.

[toc](#toc)
