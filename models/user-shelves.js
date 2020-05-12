const db = require("../database/db-config.js");

module.exports = {
  findBy,
  findByUser,
  returnShelfId,
  add,
  update,
  remove,
  findShelfWBooks,
  findBooksOnShelf,
};

function findBy(id) {
  return db("userShelves")
    .where({ id })
    .select("id as shelfId", "userId", "shelfName", "isPrivate");
}

function findShelfWBooks(shelfId) {
  return db
    .from("userShelves")
    .innerJoin("userBooks", "userShelves.userId", "userBooks.userId")
    .where("userShelves.id", shelfId);
}

function findBooksOnShelf(userId) {
  return db
    .from("userShelves")
    .innerJoin("userBooks", "userShelves.userId", "userBooks.userId")
    .where("userShelves.userId", userId);
}

function findByUser(id) {
  return db("userShelves")
    .where({ userId: id })
    .select("id as shelfId", "userId", "shelfName", "isPrivate");
}

function returnShelfId(userId) {
  return db("userShelves").where({ userId: userId }).select("id");
}

async function add(shelf) {
  const [id] = await db("userShelves").insert(shelf).returning("id");
  return findBy(id);
}

function update(updatedShelf, shelfId) {
  return db("userShelves").update(updatedShelf).where("id", shelfId);
}

function remove(shelfId) {
  return db("userShelves").where("id", shelfId).del();
}
