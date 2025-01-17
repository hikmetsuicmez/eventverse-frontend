import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet ikon ayarları
const customIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapComponent = ({ onLocationSelect, selectedPosition }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const center = [41.0082, 28.9784]; // İstanbul koordinatları

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(center, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Haritaya tıklama olayını dinle
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Önceki marker'ı kaldır
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Yeni marker ekle
        markerRef.current = L.marker([lat, lng], { icon: customIcon })
          .addTo(mapRef.current)
          .bindPopup('Etkinlik Konumu')
          .openPopup();
        
        // Koordinatları parent component'e bildir
        onLocationSelect([lat, lng]);
      });
    }

    // Eğer seçili konum varsa marker'ı göster
    if (selectedPosition && mapRef.current) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      markerRef.current = L.marker(selectedPosition, { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup('Etkinlik Konumu')
        .openPopup();
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationSelect, selectedPosition]);

  return (
    <Box sx={{ position: 'relative', height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div id="map" style={{ height: '100%', width: '100%' }} />
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          p: 1,
          borderRadius: 1,
          fontSize: '0.875rem',
          color: 'text.secondary',
          textAlign: 'center'
        }}
      >
        Haritaya tıklayarak etkinlik konumunu seçin
      </Box>
    </Box>
  );
}

export default MapComponent; 