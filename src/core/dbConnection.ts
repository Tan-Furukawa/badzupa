/* eslint-disable no-invalid-this */
import { promisify } from 'util';
import { RunResult, sqlite3 as Sqlite3, Database } from 'sqlite3';
import { topDir } from '../params';

type SQLiteArgs = [sql: string, ...params: any[]];
type PromiseDbGet = <T>(arg: string, arg2?: any) => Promise<T>;
type PromiseDbAll = <T>(arg: string, arg2?: any) => Promise<T>;

// const sqlite3: Sqlite3 =
//   process.env.NODE_ENV === 'production'
//     ? require('sqlite3')
//     : require('sqlite3').verbose();

const db = new Database(`${topDir}/data/data.db`);
// con = sqlite3.co

export const dbRun = function (...args: SQLiteArgs) {
  return new Promise<RunResult>((resolve, reject) =>
    db.run.apply(db, [
      ...args,
      function (this: RunResult, err: Error) {
        err ? reject(err) : resolve(this);
      },
    ]),
  );
};

export const dbInsert = function (sql: string, data: any[][]) {
  db.serialize(() => {
    const stmt = db.prepare(sql);
    for (let i = 0; i < data.length; i++) {
      stmt.run(data[i]);
    }
    stmt.finalize();
  });
};

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

export const dbAll: PromiseDbAll = promisify(db.all.bind(db));
