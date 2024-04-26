import axios from "axios"

export const getLocationWithoutPermission = async () => {
  return axios
    .get("https://ipinfo.io/json", {
      params: {
        token: process.env.IPINFO_TOKEN,
      },
    })
    .then((response) => {
      const data = response?.data
      if (data?.loc) {
        const [latitude, longitude] = data.loc.split(",")
        const formattedLatitude = parseFloat(latitude).toFixed(6)
        const formattedLongitude = parseFloat(longitude).toFixed(6)
        return { latitude: formattedLatitude, longitude: formattedLongitude }
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
