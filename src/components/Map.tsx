import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

export default function Map({ placesData, geoJsonData, style, flyToCoordinates }: {
  placesData: any[];
  geoJsonData: string,
  style: any
  flyToCoordinates: [number, number] | null
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(11.15);
  const [isUnmounted, setIsUnmounted] = useState(false);

  useEffect(() => {
    if (map.current && flyToCoordinates) {
      map.current.flyTo({
        center: flyToCoordinates,
        essential: true
      });
    }
  }, [flyToCoordinates]);

  useEffect(() => {
    if (!geoJsonData || map.current || !placesData || !placesData[0] || !placesData[0].coordinates) return;
    const longitude = Number(placesData[0].coordinates.longitude);
    const latitude = Number(placesData[0].coordinates.latitude);

    console.log(longitude, latitude);

    if (isNaN(longitude) || isNaN(latitude)) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [longitude, latitude],
      zoom: zoom
    });

    map.current.on('load', () => {
      map.current.addSource('line', {
        type: 'geojson',
        data: geoJsonData
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };

  }, [placesData]);

  return (
    <div className="map">
      <div ref={mapContainer} className="map-container" />
    </div>
  )
}
