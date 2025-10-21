import { Component, OnInit } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-mi-ubicacion',
  templateUrl: './mi-ubicacion.html',
  styleUrls: ['./mi-ubicacion.css']
})
export class MiUbicacionComponent implements OnInit {
  map: any;
  marker: any;
  watchId: number | null = null;
  lastPosition: { lat: number, lng: number, timestamp: number } | null = null;

  constructor() { }

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    // Crear el mapa con una ubicación por defecto (se actualizará con la ubicación real)
    const defaultPos = { lat: 19.4326, lng: -99.1332 }; // Ubicación por defecto (Ciudad de México)
    
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 15,
        center: defaultPos,
        mapTypeId: 'roadmap',
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      }
    );

    // Verificar si el navegador soporta geolocalización
    if (navigator.geolocation) {
      // Obtener la ubicación actual
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Centrar el mapa en la ubicación actual
          this.map.setCenter(pos);

          // Crear el marcador con flecha roja
          this.marker = new google.maps.Marker({
            position: pos,
            map: this.map,
            title: '¡Estás aquí!',
            animation: google.maps.Animation.DROP,
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 8,
              fillColor: '#FF0000',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              rotation: 0,
              anchor: new google.maps.Point(0, 2.5)
            },
            optimized: false
          });
          
          // Añadir círculo de precisión
          new google.maps.Circle({
            strokeColor: '#4285F4',
            strokeOpacity: 0.4,
            strokeWeight: 1,
            fillColor: '#4285F4',
            fillOpacity: 0.15,
            map: this.map,
            center: pos,
            radius: pos.accuracy || 50
          });
          
          // Guardar la posición actual
          this.lastPosition = {
            lat: pos.lat,
            lng: pos.lng,
            timestamp: Date.now()
          };

          // Iniciar el seguimiento de la ubicación en tiempo real
          this.startTracking();
        },
        () => {
          this.handleLocationError(true);
        }
      );
    } else {
      // El navegador no soporta geolocalización
      this.handleLocationError(false);
    }
  }

  startTracking() {
    if (navigator.geolocation) {
      // Detener cualquier seguimiento previo
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
      }

      // Iniciar nuevo seguimiento
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Calcular la rotación basada en la dirección del movimiento
          let rotation = 0;
          const now = Date.now();
          
          if (this.lastPosition) {
            const timeDiff = (now - this.lastPosition.timestamp) / 1000; // en segundos
            if (timeDiff > 0) {
              // Calcular el ángulo de rotación en grados
              const dLng = pos.lng - this.lastPosition.lng;
              const dLat = pos.lat - this.lastPosition.lat;
              rotation = Math.atan2(dLng, dLat) * 180 / Math.PI;
            }
          }
          
          // Actualizar la posición y rotación del marcador
          if (this.marker) {
            this.marker.setPosition(pos);
            this.marker.setIcon({
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 7,  // Tamaño aumentado para mejor visibilidad
              fillColor: '#FF0000',  // Color rojo
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#FFFFFF',
              rotation: rotation,
              anchor: new google.maps.Point(0, 2.5)  // Ajuste para mejor centrado
            });
            this.map.setCenter(pos);
          }
          
          // Actualizar la última posición
          this.lastPosition = {
            lat: pos.lat,
            lng: pos.lng,
            timestamp: now
          };
        },
        (error) => {
          console.error('Error al obtener la ubicación:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }
  }

  handleLocationError(browserHasGeolocation: boolean) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = browserHasGeolocation
        ? 'Error: El servicio de geolocalización falló. Por favor, asegúrate de haber permitido el acceso a tu ubicación.'
        : 'Error: Tu navegador no soporta geolocalización.';
    }
  }

  ngOnDestroy() {
    // Limpiar el seguimiento cuando el componente se destruye
    if (this.watchId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
}
