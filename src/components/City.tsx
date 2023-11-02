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
    <div className="dev_info">
      {city ? (
        <span>Ваш город: {city}</span>
      ) : (
        <span>Определение местоположения...</span>
      )}
    </div>
  )
}

export default City
