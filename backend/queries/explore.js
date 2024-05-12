/**
 * Generates a SQL condition string based on a user's gender and their sexual orientation preferences.
 * @param {string} sexualOrientation - The sexual orientation preference of the user to match against.
 * @param {string} gender - The gender of the user.
 * @returns {string} A SQL condition string that filters users based on the specified orientation and gender.
 */

export const getSexualPreferences = (sexualOrientation, gender) => {
  const genderQuery =
    {
      Male: "gender = 'Male'",
      Female: "gender = 'Female'",
      Both: "gender IN ('Male', 'Female')",
      Other: "gender = 'Other'",
    }[sexualOrientation] || "1=1"

  const orientationQuery =
    {
      Male: "sexual_orientation = 'Male' OR sexual_orientation = 'Both'",
      Female: "sexual_orientation = 'Female' OR sexual_orientation = 'Both'",
      Other: "sexual_orientation = 'Other'",
    }[gender] || "1=1"

  return `(${genderQuery}) AND (${orientationQuery})`
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
 * @param {string} orderBy - The ordering direction ("asc", "desc") or "rand" for random.
 * @param {number} latitude - The latitude value to use for distance calculations.
 * @param {number} longitude - The longitude value to use for distance calculations.
 * @returns {string} The SQL ORDER BY clause.
 */
export const getOrderClause = (sortBy, orderBy, latitude, longitude) => {
  let orderClause = ""
  if (orderBy === "rand") orderBy = "* RANDOM()"
  switch (sortBy) {
    case "age":
      orderClause = `ORDER BY EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) ${orderBy}`
      break
    case "distance":
      orderClause = `ORDER BY earth_distance(ll_to_earth(latitude, longitude), ll_to_earth(${latitude}, ${longitude})) ${orderBy}`
      break
    case "fameRating":
      orderClause = `ORDER BY fame_rating ${orderBy}`
      break
  }
  return orderClause
}
