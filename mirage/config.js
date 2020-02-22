export default function() {
  // this.get('/posts', () => {
  //   return {
  //       "data": [
  //         {
  //           "type": "posts",
  //           "id": "4",
  //           "attributes": {
  //             "published-at": "8/3/2020",
  //             "body": "paragraph 3",
  //             "title": "sentence 3"
  //           },
  //           "relationships": {
  //             "comments": {
  //               "data": [
  //                 {
  //                   "type": "comments",
  //                   "id": "10"
  //                 },
  //                 {
  //                   "type": "comments",
  //                   "id": "11"
  //                 },
  //                 {
  //                   "type": "comments",
  //                   "id": "12"
  //                 }
  //               ]
  //             }
  //           }
  //         },
  //         {
  //           "type": "comments",
  //           "id": "10",
  //           "attributes": {
  //             "published-at": "9/9/2020",
  //             "text": "this is comment 9"
  //           }
  //         },
  //         {
  //           "type": "comments",
  //           "id": "11",
  //           "attributes": {
  //             "published-at": "9/10/2020",
  //             "text": "this is comment 10"
  //           }
  //         },
  //         {
  //           "type": "comments",
  //           "id": "12",
  //           "attributes": {
  //             "published-at": "9/11/2020",
  //             "text": "this is comment 11"
  //           }
  //         }
  //       ]
  //     }
  // });
  // this.get('/posts', (schema, request) => {
  //   return schema.posts.all();
  // })
  this.get('/posts');
  this.get('/posts/:id');
  this.get('/comments');
  this.get('/comments/:id');

  this.get('/authors')
  this.get('/books/:id')
}
