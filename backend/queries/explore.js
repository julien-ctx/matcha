/**
 * Generates a SQL condition string based on a user's sexual orientation.
 * @param {string} sexualOrientation - The sexual orientation of the user.
 * @returns {string} A SQL condition string that filters users based on the specified orientation.
 */
export const getGenderQuery = (sexualOrientation) => {
  let orientationQuery = ""
  switch (sexualOrientation) {
    case "Male":
      orientationQuery = "gender = 'Male'"
      break
    case "Female":
      orientationQuery = "gender = 'Female'"
      break
    case "Both":
      orientationQuery = "gender IN ('Male', 'Female')"
      break
    case "Other":
      orientationQuery = "gender = 'Other'"
      break
    default:
      orientationQuery = "1=1"
  }
  return orientationQuery
}

/**
 * Calculates the offset for pagination based on the page number and the number of items per page.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {number} The offset number used for SQL queries to achieve pagination.
 */
export const getOffset = (page, limit) => {
  return (page - 1) * limit
}

/**
 * Generates an ORDER BY clause based on the specified sort criteria and order.
 * This function supports sorting by age, distance, and fame rating. For random
 * ordering, it modifies the order parameter to incorporate randomness.
 *
 * @param {string} sortBy - The field to sort by ("age", "distance", "fameRating").
 * @param {string} order - The ordering direction ("asc", "desc") or "rand" for random.
 * @param {number} latitude - The latitude value to use for distance calculations.
 * @param {number} longitude - The longitude value to use for distance calculations.
 * @returns {string} The SQL ORDER BY clause.
 */
export const getOrderClause = (sortBy, order, latitude, longitude) => {
  let orderClause = ""
  if (order === "rand") order = "* RANDOM()"
  switch (sortBy) {
    case "age":
      orderClause = `ORDER BY EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) ${order}`
      break
    case "distance":
      orderClause = `ORDER BY earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${latitude}, ${longitude})) ${order}`
      break
    case "fameRating":
      orderClause = `ORDER BY fame_rating ${order}`
      break
  }
  return orderClause
}
