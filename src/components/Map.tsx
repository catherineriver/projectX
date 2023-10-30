import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

export default function Map({ geoJsonData, style, flyToCoordinates }: {
  geoJsonData: string,
  style: any
  flyToCoordinates: [number, number] | null
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(14);

  useEffect(() => {
    if (map.current && flyToCoordinates) {
      map.current.flyTo({
        center: flyToCoordinates,
        essential: true
      });
    }
  }, [flyToCoordinates]);

  useEffect(() => {
    if (!geoJsonData || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [24.1232797, 56.9521228], // default location
      zoom: zoom
    });

    map.current.on('load', () => {
      map.current.addSource('line', {
        type: 'geojson',
        data: geoJsonData
      });

      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserLocation: true
      });

      setTimeout(() => {
        geolocate.trigger();
      }, 10);

      map.current.addControl(geolocate);
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
