import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { FeatureCollection, Feature, Point, Position } from 'geojson';

const apiKey = 'pk.eyJ1IjoiaGFybmF1bHRjYXRoZXJpbmUiLCJhIjoiY2xua3FxNjlzMDl3bDJrcGI4dWQyaGtxcCJ9.uxPl-TQVWXAvDk9d1fnGUQ'

export default function Map({ geoJsonData, style, flyToCoordinates, pointsData }: {
  geoJsonData: string,
  pointsData: any[],
  style: any
  flyToCoordinates: [number, number] | null
}) {
  const mapContainer = useRef(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [zoom, setZoom] = useState(20);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const geoJson: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: pointsData.map((point): Feature<Point> => ({
      type: 'Feature',
      properties: {
        title: point.title,
      },
      geometry: {
        type: 'Point',
        coordinates: [point.coordinates.longitude, point.coordinates.latitude] as [number, number],
      },
    })),
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        const userLocation: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        // Теперь userLocation соответствует типу LngLatLike
        setUserLocation(userLocation);
      },
      () => {
        const defaultLocation: [number, number] = [24.1232797, 56.9521228];
        // Также соответствует типу LngLatLike
        setUserLocation(defaultLocation);
      }
    );

  }, []);

  useEffect(() => {
    if (map.current && flyToCoordinates) {
      map.current.flyTo({
        center: flyToCoordinates,
        essential: true
      });
    }
  }, [flyToCoordinates]);

  useEffect(() => {
    if (!geoJsonData || map.current || !userLocation || userLocation.length !== 2) return;

    // Инициализация карты
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: userLocation,
      zoom: 10,
    });

    // Асинхронная функция для получения маршрута
    const fetchRoute = async () => {
      const coordinates = pointsData.map(point =>
        `${encodeURIComponent(point.coordinates.longitude)},${encodeURIComponent(point.coordinates.latitude)}`
      );
      const query = coordinates.join(';'); // Semi-colon for joining without encoding
      const directionsRequest = `https://api.mapbox.com/directions/v5/mapbox/walking/${query}?geometries=geojson&access_token=${apiKey}`;

      const testQuery = 'https://api.mapbox.com/directions/v5/mapbox/walking/13.631899%2C45.08361%3B13.633303%2C45.083569?alternatives=true&continue_straight=true&geometries=geojson&language=en&overview=full&steps=true&access_token=pk.eyJ1IjoiaGFybmF1bHRjYXRoZXJpbmUiLCJhIjoiY2xua3FxNjlzMDl3bDJrcGI4dWQyaGtxcCJ9.uxPl-TQVWXAvDk9d1fnGUQ'
      console.log('Mapbox API Request URL:', directionsRequest);

      try {
        const response = await fetch(directionsRequest);
        const data = await response.json();
        console.log('Data:', data);

        if (data.routes && data.routes.length > 0) {
          console.log('Route data:', data.routes[0].geometry);

          if (map.current.isStyleLoaded()) {
            // Добавление маршрута на карту
            map.current.addSource('route', {
              type: 'geojson',
              data: data.routes[0].geometry,
            });

            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#ff0000',
                'line-width': 4,
              },
            });
          } else {
            console.error('Map style is not yet loaded');
          }
        } else {
          console.error('No routes found in the data');
        }
      } catch (error) {
        console.error('Ошибка при запросе к Mapbox Directions API:', error);
      }
    };

    // Загрузка карты и добавление маркеров
    map.current.on('load', () => {
      // Добавление источника точек и маркеров
      map.current.addSource('points', {
        type: 'geojson',
        data: geoJson,
      });

      geoJson.features.forEach((feature) => {
        const coordinates: [number, number] = feature.geometry.coordinates as [number, number];
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerText = feature.properties.title;

        new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current);
      });

      // Получение и добавление маршрута
      fetchRoute();
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };

  }, [geoJsonData]);




  return (
    <div className="map">
      <div ref={mapContainer} className="map-container" />
    </div>
  )
}
