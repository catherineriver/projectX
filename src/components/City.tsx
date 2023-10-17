import { useState, useEffect } from 'react'

const City = () => {
  const [city, setCity] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`,
        )
        const data = await response.json()
        setCity(data.locality)
      })
    } else {
      setCity('Геолокация не поддерживается вашим браузером.')
    }
  }, [])

  return (
    <div>
      <h1>Определение города</h1>
      {city ? <p>Ваш город: {city}</p> : <p>Определение местоположения...</p>}
    </div>
  )
}

export default City
