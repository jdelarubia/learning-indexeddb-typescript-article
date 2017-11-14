# Working with IndexedDB, in Typescript

This is a little tutorial based on the excellent tutorial from Google Developers, [Working with IndexedDB](https://developers.google.com/web/ilt/pwa/working-with-indexeddb), using [Jake Archibald's IDB Javascript library](https://github.com/jakearchibald/idb), but leveraging Typescript type hinting.

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

```
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

## 00 Setting up your index.html

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

## 01 Opening a database

On your */src/main.ts*, type in the following code.

```typescript
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
