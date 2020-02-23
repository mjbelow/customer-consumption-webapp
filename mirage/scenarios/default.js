export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */
  let bestPublisher = server.create('publisher', {name: "Best Publisher"})
  let books = [
    [
      server.create('book', {title: "Book Title"}),
      server.create('book', {title: "Another Book Title"})
    ],
    [
      server.create('book', {title: "New Book"})
    ],
  ]

  server.createList('post', 10);
  // server.createList('author', 5);
  server.create('author', {
    name: "Matthew",
    books: books[0],
    bestSellers: [
      // for server.create(): bestSeller, best-sellar, best-Sellar (all work)
      server.create('best-seller', {title: "My Best Seller Book", "best-seller-date": "1/2/2020"}),
      server.create('best-seller', {title: "Another Best Seller", "best-seller-date": "5/7/2020"})
    ],
    publisher: bestPublisher
  })
  server.create('author', {
    name: "James",
    books: books[1],
    publisher: bestPublisher
  })
}
