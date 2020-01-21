const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const mysql = require('mysql');
const path = require('path');

// データ型を指定
// フィールド名: 返却データ型
const schema = buildSchema(`
  type Book {
    name: String
    author: String
  }
  type Query {
    books(name: String, author: String): [Book]
  }
 `)

const books = [
  {
    name: 'abc',
    author: 'test1'
  },
  {
    name: 'def',
    author: 'test2'
  },
  {
    name: 'ghi',
    author: 'test3'
  }
]
const root = {
  books: (search) => {
    return new Promise((resolve) => {
      let conditions = 'SELECT * FROM `books`'
      const filter = Object.keys(search)
      if (filter.length !== 0) {
        conditions += ' WHERE `' + filter[0] + '` = "' + search[filter[0]] + '"'
      }
      connectDB(conditions).then((results) => {
        resolve(results)
      })
    })
  },
}

const connectDB = (conditions) => {
  return new Promise((resolve) => {
    const mysql = require('mysql')
    const connection = mysql.createConnection({
      host: 'gql_db',
      user: 'root',
      password: 'root',
      database: 'gqldb'
    })
    connection.connect((err) => {
      if (err) {
        console.error('error connecting: ' + err.stack)
        resolve()
      }
      console.log('connected')
      connection.query(conditions, (err, results, fields) => {
        resolve(JSON.parse(JSON.stringify(results)))
      })
    })
  })
}

const app = express()
// https://github.com/graphql/express-graphql
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}))
app.use(express.static(path.join(__dirname, 'public')));
app.listen(8080, () => {
  console.log('Now browse to localhost:8080/graphql')
})
