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
    <div className="dev_info">
      {location ? (
        <span>
          Широта: {location.latitude} | Долгота: {location.longitude} |
          Точность: {location.accuracy} метров
        </span>
      ) : (
        <p>Определение местоположения...</p>
      )}
    </div>
  )
}

export default Geolocation
