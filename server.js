// Learn graphQL in 40 mins
// url - https://youtu.be/ZQL7tL2S0oQ

const express = require("express")
const { graphqlHTTP } = require("express-graphql")
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require ("graphql")

//////////////////
// DUMMY DATA
//////////////////
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];


// Define AUTHOR GraphQL custom object
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'Author details',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type : GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

// Define BOOK GraphQL custom object
const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'Single book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type : GraphQLNonNull(GraphQLString) },
        authorId : { type: GraphQLNonNull(GraphQLInt)  },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.id)
            }
        }
    })
})

// Define ROOT QUERY type
const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    // DEfine ALL QUEIES HERE

    // Just add the BOOK type query
    book: {
      type: BookType,
      description: "Single book from Id",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        // Find book based on povided Id
        return books.find((book) => book.id === args.id);
      },
    },
    // Just add the BOOKS type query
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books, // This would be a Dbase call, simple for now
    },
    // Just add the AUTHORS type
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all authors",
      resolve: () => authors, // This would be a Dbase call, simple for now
    },
    // Just add the AUTHOR type
    author: {
      type: AuthorType,
      description: "Single author",
      args: {
        name: { type: GraphQLString }
      },
      resolve: (parent, args) => {
        return authors.find((author) => author.name === args.name)
      }, 
    },
  }),
});

// Define ROOT MUTATION type
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Mutation defined here',
    fields: () => ({
        // Doesn't add in this case becasue it's a static array - but will if we made a dbase call
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name}
                authors.push(author);
                return author;
            }
        },
    })
})

// DEFINE SCHEMA
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})



// SERVER INIT
const app = express();
app.listen(5000., () => { console.log('server is running')})
app.use("/graphql", graphqlHTTP({
    graphiql: true,
    schema: schema
}))




//////////////////
// DUMPS - Ignore
//////////////////

// DEFINE SCHEMA
// const schema = new GraphQLSchema({
//     query: new GraphQLObjectType({
//         name: "helloWorld",
//         fields: () => ({
//             message: { 
//                 type: GraphQLString,
//                 resolve: () => "Hello World"
//             }
//         })
//     })
// })



// http://localhost:5000/

// ----------------------
// Query in graphql
// ----------------------

// query {
// 	books {
//     id
//     name
//     author {
//     	name
//     }
// 	}
//   authors {
//     id
//     name
//     books {
//       name
//     }
//   }
//   book(id:1) {
//     name
//     author {
//       name
//     }
//   }
//   author(name: "J. K. Rowling") {
//     books {
//       name
//     }
//   }
// }

// ----------------------
// Mutation in graphql
// ----------------------

// mutation {
//   addBook(name:"Para's book", authorId: 4) {
//     name
    
//   }
  
//   addAuthor( name: "Para",  ){
//     name
//     id
//   }
// }