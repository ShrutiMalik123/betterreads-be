const helper = require("./helpers.js");
const router = require("express").Router();
const BooksOnShelf = require("../models/user-books-on-a-shelf.js");
const UserShelves = require("../models/user-shelves");
const UserBooks = require("../models/user-books");
const Books = require("../models/books.js");

router.post("/shelves/:shelfId", (req, res) => {
  const shelfId = req.params.shelfId;
  const book = req.body.book;
  const googleId = req.body.book.googleId;
  const status = req.body.readingStatus;
  const favorite = req.body.favorite;
  const userRating = req.body.userRating

  UserShelves.findBy(shelfId)
    .first().then(shelf => {
      const userId = shelf.userId;
      Books.findBy({ googleId }).first().then(foundbook => {
          if (foundbook == undefined) {
            Books.add(book).then(bk => {
              const newUserBookObject = helper.createUserBook(
                bk, userId, favorite, status, userRating
              );
              UserBooks.add(newUserBookObject).then(added => {
                const bookId = added.bookId;
                helper.addToUserShelf(req, res, BooksOnShelf, shelfId, bookId);
              }).catch(({ nam3e, message, stack }) => res.status(500).json({ message: "could not add book to user library", name, message, stack }));
            }).catch(({ name, message, stack }) => res.status(500).json({ error: "could not add book to all books", name, message, stack }));
        } else {
            UserBooks.isBookInUserBooks(userId, foundbook.googleId)
              .first()
              .then(inlibrary => {
                if (inlibrary == undefined) {
                  const userBookObject = helper.createUserBook(
                    foundbook, userId, favorite, status, userRating
                  );
                  UserBooks.add(userBookObject).then(() => {
                    const bookId = foundbook.id;
                    helper.addToUserShelf(req, res, BooksOnShelf, shelfId, bookId);
                  }).catch(({ name, message, stack }) => res.status(404).json({ error: "could not add to user library", name, message, stack }));
                } else if (Object.keys(inlibrary).length > 0) {
                  const bookId = inlibrary.bookId;
                  helper.addToUserShelf(
                    req, res, BooksOnShelf, shelfId, bookId
                  );
                } else {
                  res.status(500).json({ message: "Aasa's fault" });
                }
              }).catch(({ name, message, stack }) => res.status(404).json({ message: "book not in library", name, message, stack }));
        }
      }).catch(({ name, message, stack }) => res.status(500).json({ error: "error finding book", name, message, stack }));
  }).catch(({ name, message, stack }) => res.status(404).json({ error: "could not find shelf", name, message, stack }));
});

router.delete("/shelves/:shelfId", (req, res) => {
  const shelfId = req.params.shelfId;
  const bookId = req.body.bookId;
  if ((bookId, shelfId)) {
    BooksOnShelf.remove(bookId, shelfId)
      .then(deleted => res.status(200).json({ message: "book removed from shelf", deleted: deleted }))
      .catch(({ name, message, stack }) => res.status(500).json({ error: "error in removing book from shelf", name, message, stack }));
  } else {
    res.status(400).json({ message: "Could not delete book on shelf" });
  }
});

router.put("/shelves/:shelfId", (req, res) => {
  const shelfId = req.params.shelfId;
  const bookId = req.body.bookId;
  const newShelfId = req.body.newShelfId;

  if ((bookId, shelfId, newShelfId)) {
    BooksOnShelf.update(bookId, shelfId, newShelfId)
      .then(updated => {
        if (updated[0].id) {
          res.status(200).json({ message: "book moved to new shelf", ShelfId: updated });
        } else {
          res.status(500).json({ message: "check bookId, shelfId and newShelfId" });
        }
      })
      .catch(({ name, message, stack }) => res.status(500).json({ error: "error in moving book to shelf", name, message, stack }));
  } else {
    res.status(400).json({
        message:
        "Could not update book on shelf, This endpoint requires bookId, shelfId and newShelfId"
    });
  }
});

router.get("/shelves/:shelfId", (req, res) => {
  const shelfId = req.params.shelfId;
  const bookId = req.body.bookId;
  if (shelfId) {
    BooksOnShelf.findBook(shelfId, bookId)
      .then(book => res.status(200).json(book))
      .catch(({ name, message, stack }) => res.status(500).json({ error: "error in getting books from the shelf", anem, message, stack }));
  } else {
    res.status(404).json({ message: "no shelf id exist" });
  }
});

router.get("/user/:userId/shelves/:shelfId/allbooks", (req, res) => {
  const { shelfId, userId } = req.params;
  if (shelfId) {
    BooksOnShelf.findAllBooks(shelfId, userId)
      .then(books => {
          res.status(200).json(books);
      })
      .catch(({ name, message, stack }) => res.status(500).json({ error: "error in getting books from the shelf", name, message, stack }));
  } else {
    res.status(404).json({ message: "no shelf id exist" });
  }
});

router.get("/user/:userId/shelves/allbooks", async (req, res) => {
  const userId = req.params.userId;
  BooksOnShelf.returnEveryShelfFrom(userId)
    .then(shelves => res.status(200).json(shelves))
    .catch(({ name, message, stack }) => res.status(500).json({ error: "or getting all shelves", name, message, stack }))
})

module.exports = router;