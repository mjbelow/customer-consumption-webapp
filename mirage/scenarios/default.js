export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  server.createList('post', 10);
  // server.createList('author', 5);
  server.create('author', {
    name: "Matthew",
    books: [
      server.create('book', {title: "Book Title"}),
      server.create('book', {title: "Another Book Title"})
    ]
  })
  server.create('author', {
    name: "James",
    books: [
      server.create('book', {title: "New Book"})
    ]
  })
}
