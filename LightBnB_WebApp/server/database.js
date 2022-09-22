const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query(`SELECT * FROM users WHERE email = $1`, [email])
  .then((result) => {
    //console.log('getUserWithEmail', result.rows);
    return result.rows[0];
  })
  .catch((err) => {
    return null;
  });
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query(`SELECT * FROM users WHERE id = $1`, [id])
  .then((result) => {
    //console.log('getUserWithId', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    return null;
  });
};

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function(user) {
  // console.log('user', user);
  return pool
  .query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, [user.name, user.email, user.password])
  .then((result) => {
    //console.log('result', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    return null;
  });
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */

const getAllReservations = function(guest_id, limit = 10) {
  return pool
  .query(` SELECT reservations.id, properties.*, reservations.start_date, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date
  LIMIT $2;`, [guest_id, limit])
  .then((result) => {
    console.log('getAllReservations', result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
//  SELECT properties.id, title, cost_per_night, AVG(property_reviews.rating) as average_rating
//  FROM properties
//  JOIN property_reviews ON properties.id = property_id
//  WHERE city LIKE '%ancouv%'
//  GROUP BY properties.id
//  HAVING AVG(property_reviews.rating) >= 4
//  ORDER BY cost_per_night 
//  LIMIT 10;

const getAllProperties = function(options) {
  const queryParams = [];
  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id`;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }
 
  console.log(queryString, queryParams);
  return pool
  .query(queryString, queryParams)
  .then((result) => {
    console.log('getAllProperties', result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
};

// const getAllProperties = function(options, limit = 10) {
//   return pool
//   .query(`SELECT * FROM properties LIMIT $1`, [limit])
//   .then((result) => {
//     console.log('getAllProperties', result.rows);
//     return result.rows;
//   })
//   .catch((err) => {
//     console.log(err.message);
//   });
// };
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  return pool
  .query(`INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;`, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property. post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms,])
  .then((result) => {
    //console.log('result', result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    return null;
  });
};

exports.addProperty = addProperty;
