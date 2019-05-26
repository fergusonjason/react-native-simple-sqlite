# react-native-simple-sqlite
Simple frontend for react-native-sqlite-storage

# What is this thing?

This is my simple frontend to react-native-sqlite-storage for performing simple CRUD operations without all the boilerplate code. This used to be a file
called DbUtils.js in my projects, but since I kept copy/pasting it into my other projects so it was time to split it out.

Be aware that as of the time I'm writing this, I have no idea how to properly create an NPM library. But I'm trying.

Also be aware that this is a refactor of existing code and may currently be broken as of May 2019. I'll remove this notice once I get a chance to test.

# How do you use this thing?

## Importing the library

Old-School Require-Based Method

(To Be Added)

ES6 Method

```javascript
import {open, close, query, execute} from "rnss";
```

## Opening and Closing a Database

Promise-Based Method

```javascript
var dbparams = {name:"mydb.db", createFromLocation: false};
var db = open(dbparams).then(function(db) {
    // do something
}).then(function(results) {
    close(db);
});

```

ES 6 Method

```javascript
let dbparams = {name:"mydb.db", createFromLocation: false};
try {
    let db = await open(dbparams);
    // do something
    await close(db);
} catch (err) {
    console.log(err.message);
}
```

## Executing a Select

The `query()` method takes three arguments:
- db
- sql
- params

The db is the database you opened in the previous step.

The sql is a String containing the parameterized SQL statement you want to execute.

The params are an array containing (in order) the parameters for the SQL statement. For SQL without parameters, use an empty array.

If the query is successful, a Javascript object will be returned with two members:
- result - array of the query results
- totalRows - total number of results

If the query is unsuccessful, a different object will be returned with 4 members:
- hasErrors - set to true (I'll probably remove this)
- errorMessage - a String containing the error message SQLite sent back
- sqliteErrorCode - the numeric error code SQLite returned
- rowsAffected - set to 0 (I'll probably remove this too)

Promise-Based

```javascript
    .then(function(db) {
        var queryResults = query(db, "SELECT LASTNAME, FIRSTNAME FROM EMPLOYEES WHERE EMP_ID=?",[1001]);
        resolve(queryResults);
    }).then(function(results) {
        console.log("Result: " + JSON.stringify(results.result) + ", total rows: " + result.totalRows);
    }).catch(function(err) {
        console.log("Query returned error: " + err.message);
    })
```

ES6

```javascript
    try {
        let queryResults = await query(db, "SELECT LASTNAME, FIRSTNAME FROM EMPLOYEES WHERE EMP_ID=?",[1001]);
    } catch (err) {
        console.log("Query returned error: " + err.message);
    }
```

## Executing a UPDATE/DELETE/INSERT

Executing Update/Delete/Insert statements is similar to a select statement, but uses the `execute()` method instead.

As before, the `execute()` method takes 3 arguments:

- db
- sql
- params

See the documentation for query for argument descriptions.

Promise-Based

```javascript
    .then(function(db) {
        let result = execute(db, "DELETE FROM EMPLOYEES WHERE EMP_ID=?",[1001]);
        resolve(result);
    }).then(function(result) {
        // do something
    }).catch(functio(err) {

    });
```

ES6

```javascript
    let result = await execute(db, "DELETE FROM EMPLOYEES WHERE EMP_ID=?",[1001]);
```