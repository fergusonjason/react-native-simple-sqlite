/*
 * sqlite.ios.core.js
 *
 * Created by Andrzej Porebski on 10/29/15.
 * Copyright (c) 2015-2016 Andrzej Porebski.
 *
 * This software is largely based on the SQLLite Storage Cordova Plugin created by Chris Brody & Davide Bertola.
 * The implementation was adopted and converted to use React Native bindings.
 *
 * See https://github.com/litehelpers/Cordova-sqlite-storage
 *
 * This library is available under the terms of the MIT License (2008).
 * See http://opensource.org/licenses/alphabetical for full text.
 */
var SQLite = require("react-native-sqlite-storage");

SQLite.DEBUG(true);
SQLite.enablePromise(true);

/**
 * Return a Promise<SQLiteDatabase>
 * 
 * @param {} dbparams 
 */
function open(dbparams) {

    return new Promise(function(resolve, reject) {
        if (dbparams == null || typeof dbparams === "undefined") {
            reject("dbparams is null or not defined");
        }

        if (!dbparams.name) {
            reject("name is not defined in dbparams");
        }

        if (!dbparams.createFromLocation) {
            reject("createFromLocation is not defined in dbparams");
        }

        resolve(SQLite.openDatabase({ name: dbparams.name, createFromLocation: dbparams.createFromLocation }));
    })

}

/**
 * Return Promise<void>
 * 
 * @param {*} db 
 */
function close(db) {

    return new Promise(function(resolve, reject) {
        if (db == null || typeof db === "undefined") {
            reject("DB is null or undefined");
        }

        resolve(db.close());

    });

}

/**
 * Returns Promise<obj> where the object has two members: result and totalRows or rejects with
 * an object with error details
 * 
 * @param {*} db 
 * @param {*} sql 
 * @param {*} params 
 */
function query(db, sql, params) {

    if (db === undefined) {
        console.log("DB is undefined inside query");
    }

    return new Promise(function(resolve, reject) {

        if (db == null || typeof db === "undefined") {
            reject("DB is null or undefined");
        }

        db.readTransaction((tx) => {
            console.log("Beginning transaction");

            tx.executeSql(sql, params, (tx, rs) => {
                let totalRows = rs.rows.length;
                let result = [];

                for (i = 0; i < totalRows; i++) {
                    result.push(rs.rows.item(i));
                }

                resolve({ result, totalRows });
            }, (err) => { 
                console.log("Error occured executing sql: code: " + err.code + ", message: " + err.message + "(" + JSON.stringify(err) + ")");
                reject(convertSqliteErrorMessage(err.message));
            });


        });
    });

}

function execute (db, sql, params) {

    return new Promise(function(resolve, reject) {

        if (db == null || typeof db === "undefined") {
            reject("DB is null or undefined");
        }

        db.transaction((tx) => {
            console.log("Beginning transaction");
            tx.executeSql(sql, params, (tx, rs) => {
                let rowsAffected = rs.rowsAffected;
                
                resolve({"rowsAffected":rowsAffected});
                //resolve({hasErrors, errorMessage, sqliteErrorCode, rowsAffected});

            });
        }, (err) => {
            console.log("Error occured in sql: code: " + err.code + ", message: " + err.message);
            reject(convertSqliteErrorMessage(err.message));

        });
    });

}


function convertSqliteErrorMessage(message) {
    
    var regex = /^(.*) \(code (\d+)\)$/g;

    var validError = message.match(regex);
    var errorObj = {};
    if (validError) {
        var regexResult = regex.exec(message);
        errorObj.hasErrors = true;
        errorObj.errorMessage = regexResult[1];
        errorObj.sqliteErrorCode = new Number(regexResult[2]);
        errorObj.rowsAffected = 0;
    } else {
        errorObj.hasErrors = true;
        errorObj.errorMessage = "Unable to parse SQLite Error Message";
    }

    return errorObj;

}

/**
 * Query method that returns a promise. Used so that redux/thunk don't get pissy.
 * 
 * SQLite object's enablePromise must be true for this to work
 * 
 * @async
 * @function
 * @param {string} sql for method to execute
 * @param {array} params parameters for sql statement
 * @returns {Promise<array>} The array of objects returned by the query
 */
queryPromise = async (sql, params) => {

    console.log(`Entered queryPromise, sql: ${sql}, params: ${params} `);

    // enable promise has to be true
    let db = null;

    let dbPromise2 = SQLite.openDatabase({ name: "stats.db", createFromLocation: "~soccerstats.db" });

    let results = dbPromise2.then((resolvedDb) => {
        // this is a dirty way of doing this, but I need the resolved db for the next peice of the chain
        db = resolvedDb; 
        return query(db, sql, params);
    }).then((queryResults) => {
        close(db);
        
        return queryResults;
    })

    return results;
}

/**
 * Function to execute a sql statement
 * 
 * @async
 * @function
 * @param {string} sql sql statement to execute (UPDATE, DELETE, INSERT)
 * @param {Array<string>} params params for the SQL statement
 * @returns {Promise<object>} object with the following keys: hasErrors, errorMessage, sqlLiteErrorCode, rowsAffected
 */
function executePromise(sql, params) {

    let db = null;

    let dbPromise2 = SQLite.openDatabase({ name: "stats.db", createFromLocation: "~soccerstats.db" });

    let results = dbPromise2.then((resolvedDb) => {
        db = resolvedDb;
        return execute(db, sql, params);
    }).then((queryResults) => {
        close(db);
        return queryResults;
    });

    return results;

}

module.exports = {
    open,
    close,
    query,
    execute
}
//export { open, close, query, execute, queryPromise, executePromise };

