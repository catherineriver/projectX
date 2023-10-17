import { useState, useEffect } from 'react'

const Geolocation = () => {
  const [location, setLocation] = useState(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      })
    } else {
      setLocation('Геолокация не поддерживается вашим браузером.')
    }
  }, [])

  return (
    <div>
      <h1>Определение геолокации</h1>
      {location ? (
        <div>
          <p>Широта: {location.latitude}</p>
          <p>Долгота: {location.longitude}</p>
          <p>Точность: {location.accuracy} метров</p>
        </div>
      ) : (
        <p>Определение местоположения...</p>
      )}
    </div>
  )
}

export default Geolocation
