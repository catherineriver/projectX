import { useState, useEffect } from 'react'

const Timezone = () => {
  const [time, setTime] = useState(null)
  const [timezone, setTimezone] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date()
      setTime(date.toLocaleTimeString())
      setTimezone(
        date
          .toLocaleTimeString('en-us', { timeZoneName: 'short' })
          .split(' ')[2],
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1>Часовой пояс и текущее время</h1>
      {time && timezone && (
        <div>
          <p>Текущее время: {time}</p>
          <p>Часовой пояс: {timezone}</p>
        </div>
      )}
    </div>
  )
}

export default Timezone
