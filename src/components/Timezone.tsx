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
    <div className="dev_info">
      {time && timezone && (
        <div>
          <span>
            Текущее время: {time} | Часовой пояс: {timezone}
          </span>
        </div>
      )}
    </div>
  )
}

export default Timezone
