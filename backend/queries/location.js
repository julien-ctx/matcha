import axios from "axios"
import dotenv from "dotenv"

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
