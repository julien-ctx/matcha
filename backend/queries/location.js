import axios from "axios"
import dotenv from "dotenv"
import * as turf from "@turf/turf"

dotenv.config({ path: "../../.env" })

/**
 * Fetches the user's geographical location based on their IP address without explicit permission.
 * @returns {Promise<Object|undefined>} A promise that resolves to an object containing latitude, longitude, city, and country if successful, or undefined if an error occurs or location data is unavailable.
 */
export const getLocationWithoutPermission = async () => {
  return axios
    .get("https://ipinfo.io/json", {
      params: {
        token: process.env.IPINFO_TOKEN,
      },
    })
    .then((response) => {
      const data = response?.data
      if (data?.loc && data?.city && data?.country) {
        const [latitude, longitude] = data.loc.split(",")
        const formattedLatitude = parseFloat(latitude).toFixed(6)
        const formattedLongitude = parseFloat(longitude).toFixed(6)
        return {
          latitude: formattedLatitude,
          longitude: formattedLongitude,
          city: data.city,
          country: data.country,
        }
      } else {
        console.error("Location data not available")
        return undefined
      }
    })
    .catch((error) => {
      console.error("Error fetching IP geolocation", error)
      return undefined
    })
}

/**
 * Retrieves location details (city and country) from provided latitude and longitude using the OpenCage Data API.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<Object|undefined>} A promise that resolves to an object containing city and country if successful, or undefined if an error occurs or no location data is found.
 */
export const getLocationFromLatitudeLongitude = async (latitude, longitude) => {
  const apiKey = process.env.OPENCAGE_TOKEN
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`

  try {
    const response = await axios.get(url)
    const data = response.data

    if (data.results && data.results.length > 0) {
      const components = data.results[0].components
      const city = components.city || components.town || components.village
      const { country } = components
      return {
        city,
        country,
      }
    } else {
      console.error("Failed to retrieve location data")
      return undefined
    }
  } catch (error) {
    console.error("Failed to retrieve location data:", error)
    return undefined
  }
}

/**
 * Calculates the distance between two geographical points.
 *
 * @param {number} latitude1 - Latitude of the first point.
 * @param {number} longitude1 - Longitude of the first point.
 * @param {number} latitude2 - Latitude of the second point.
 * @param {number} longitude2 - Longitude of the second point.
 * @returns {string|null} The distance in kilometers between the two points, rounded to six decimal places, or null if any input is undefined.
 */
export const getDistance = (latitude1, longitude1, latitude2, longitude2) => {
  if (
    latitude1 === undefined ||
    longitude1 === undefined ||
    latitude2 === undefined ||
    longitude2 === undefined
  ) {
    return null
  }

  const point1 = turf.point([longitude1, latitude1])
  const point2 = turf.point([longitude2, latitude2])
  const options = { units: "kilometers" }

  const distance = turf.distance(point1, point2, options)
  return distance.toFixed(6)
}
