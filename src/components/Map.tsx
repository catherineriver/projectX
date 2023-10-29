import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'

export default function Map({ geoJsonData, style, flyToCoordinates }: {
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
    if (!geoJsonData || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [24.1232797, 56.9521228], // user location here, reverse
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

  }, [geoJsonData]);

  return (
    <div className="map">
      <div ref={mapContainer} className="map-container" />
    </div>
  )
}
