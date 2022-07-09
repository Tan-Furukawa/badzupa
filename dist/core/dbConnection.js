"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbAll = exports.dbInsert = exports.dbRun = void 0;
/* eslint-disable no-invalid-this */
const util_1 = require("util");
const sqlite3_1 = require("sqlite3");
const params_1 = require("../params");
// const sqlite3: Sqlite3 =
//   process.env.NODE_ENV === 'production'
//     ? require('sqlite3')
//     : require('sqlite3').verbose();
const db = new sqlite3_1.Database(`${params_1.topDir}/data/data.db`);
// con = sqlite3.co
const dbRun = function (...args) {
    return new Promise((resolve, reject) => db.run.apply(db, [
        ...args,
        function (err) {
            err ? reject(err) : resolve(this);
        },
    ]));
};
exports.dbRun = dbRun;
const dbInsert = function (sql, data) {
    db.serialize(() => {
        const stmt = db.prepare(sql);
        for (let i = 0; i < data.length; i++) {
            stmt.run(data[i]);
        }
        stmt.finalize();
    });
};
exports.dbInsert = dbInsert;
// export const dbForEach = function (
//   sql: string,
//   data: (string | number | boolean)[][],
// ) {
//   const stmt = db.prepare(sql);
//   for (let i = 0; i < data.length; i++) {
//     for (let j = 0; j < data[i].length; j++) {
//       stmt.run([j, data[i][j]]);
//     }
//   }
//   stmt.finalize();
// };
// db.all()
// export const dbConnect = function () {
// }
// export const dbDisconnect = function () {
//   return {
//   }
// }
exports.dbAll = (0, util_1.promisify)(db.all.bind(db));
//# sourceMappingURL=dbConnection.js.map