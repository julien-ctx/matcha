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

