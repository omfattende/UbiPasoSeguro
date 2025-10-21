import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Google Maps will be available globally through the script tag

interface UserLocation {
  id: string;
  nombre: string;
  comentario: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

@Component({
  selector: 'app-ubi-programa',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './ubi-programa.html',
  styleUrl: './ubi-programa.css'
})
export class UbiPrograma implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLElement>;
  map: google.maps.Map | undefined;
  marker: google.maps.Marker | undefined;
  watchId: number | null = null;
  lastPosition: { lat: number; lng: number, timestamp: number } | null = null;
  
  currentLocation: { latitude: number; longitude: number; accuracy: number } | null = null;
  mapUrl: SafeResourceUrl = '';
  streetViewUrl: SafeResourceUrl = '';
  loading: boolean = true;
  locationError: string = '';
  showStreetView: boolean = false;
  
  // Datos del formulario de registro
  registroForm = {
    nombre: '',
    comentario: ''
  };
  
  // Lista de ubicaciones de usuarios
  userLocations: UserLocation[] = [];
  
  // Estado del formulario
  registrando: boolean = false;
  registroSuccess: string = '';
  registroError: string = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadUserLocations();
  }

  ngAfterViewInit() {
    // Wait for Google Maps API to load
    const checkMap = () => {
      if (window['google'] && window['google'].maps) {
        this.initMap();
        return; // Exit if map is loaded
      }

      if (this.loading) {
        // If not loaded after 5 seconds, show error
        const timeout = setTimeout(() => {
          if (this.loading && !this.locationError) {
            this.locationError = 'No se pudo cargar Google Maps. Por favor verifica tu conexión a internet y recarga la página.';
            this.loading = false;
          }
        }, 5000);

        // Try again after a short delay
        setTimeout(() => {
          if (this.loading) {
            checkMap();
          }
        }, 100);
      }
    };
    
    // Initial check
    checkMap();
  }

  initMap() {
    if (!this.mapContainer?.nativeElement) {
      console.error('Map container not found');
      this.loading = false;
      return;
    }
    
    const google = window['google'];
    if (!google?.maps) {
      console.error('Google Maps API not loaded');
      this.locationError = 'Error al cargar Google Maps. Por favor recarga la página.';
      this.loading = false;
      return;
    }
    
    // Asegurarse de que el contenedor del mapa tenga un tamaño definido
    const container = this.mapContainer.nativeElement;
    container.style.height = '400px'; // o el tamaño que prefieras
    container.style.width = '100%';

    // Crear el mapa con una ubicación por defecto (se actualizará con la ubicación real)
    const defaultPos = { lat: 19.4326, lng: -99.1332 }; // Ubicación por defecto (Ciudad de México)
    
    this.map = new google.maps.Map(this.mapContainer.nativeElement, {
      zoom: 15,
      center: defaultPos,
      mapTypeId: 'roadmap',
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
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
    });

    // Verificar si el navegador soporta geolocalización
    if (navigator.geolocation) {
      // Obtener la ubicación actual
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handlePositionUpdate(position);
        },
        (error) => {
          this.handleLocationError(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Iniciar seguimiento de ubicación
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.handlePositionUpdate(position);
        },
        (error) => {
          this.handleLocationError(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    } else {
      this.locationError = 'La geolocalización no es compatible con este navegador.';
      this.loading = false;
    }
  }

  handlePositionUpdate(position: GeolocationPosition) {
    try {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      this.currentLocation = {
        latitude: pos.lat,
        longitude: pos.lng,
        accuracy: pos.accuracy
      };

      // Configurar el marcador si hay ubicación actual
      if (this.currentLocation && this.map) {
        const position = {
          lat: this.currentLocation.latitude,
          lng: this.currentLocation.longitude
        };

        const markerOptions: google.maps.MarkerOptions = {
          position: position,
          map: this.map,
          title: 'Tu ubicación',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#FFFFFF'
          },
          optimized: false
        };

        if (!this.marker) {
          // Crear el marcador si no existe
          this.marker = new google.maps.Marker(markerOptions);
        } else {
          // Actualizar la posición del marcador existente
          this.marker.setPosition(position);
        }
      }

      // Actualizar la vista del mapa
      if (this.map) {
        this.map.setCenter(pos);
        this.map.setZoom(17); // Zoom más cercano para mejor visualización
      }

      // Actualizar las URLs para los iframes (si se usan en otra parte)
      this.updateMapUrls(pos.lat, pos.lng);
      
      this.loading = false;
      this.locationError = ''; // Limpiar cualquier error previo
    } catch (error) {
      console.error('Error en handlePositionUpdate:', error);
      this.handleLocationError({
        code: 0,
        message: 'Error al procesar la ubicación',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3
      } as GeolocationPositionError);
    }
  }

  // Manejar errores de geolocalización
  handleLocationError(error: GeolocationPositionError) {
    console.error('Error de geolocalización:', error);
    
    let errorMessage = 'No se pudo obtener tu ubicación. ';
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += 'Permiso denegado por el usuario.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += 'La información de ubicación no está disponible.';
        break;
      case error.TIMEOUT:
        errorMessage += 'La solicitud de ubicación ha expirado.';
        break;
      default:
        errorMessage += 'Error desconocido.';
    }
    
    this.locationError = errorMessage;
    this.loading = false;
    
    // Mostrar ubicación por defecto (Ciudad de México) si el mapa está disponible
    if (this.map) {
      const defaultPos = { lat: 19.4326, lng: -99.1332 };
      this.map.setCenter(defaultPos);
      this.map.setZoom(10);
    }
  }

  updateMapUrls(lat: number, lng: number) {
    const apiKey = 'TU_API_KEY'; // Reemplaza con tu API key de Google Maps
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=18&maptype=roadmap`
    );
    this.streetViewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&heading=210&pitch=10&fov=90`
    );
  }

  getCurrentLocation() {
    this.loading = true;
    this.locationError = '';

    if (!navigator.geolocation) {
      this.locationError = 'La geolocalización no está soportada en tu navegador.';
      this.loading = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };

        // Crear URL del mapa con Google Maps Embed mostrando todos los marcadores
        const mapUrlString = this.buildMapUrl();
        
        this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrlString);
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            this.locationError = 'Permiso denegado. Por favor, permite el acceso a tu ubicación.';
            break;
          case error.POSITION_UNAVAILABLE:
            this.locationError = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            this.locationError = 'La solicitud de ubicación ha expirado.';
            break;
          default:
            this.locationError = 'Error desconocido al obtener la ubicación.';
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  buildMapUrl(): string {
    if (!this.currentLocation) return '';
    
    // Construir URL con marcadores de todos los usuarios
    let url = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${this.currentLocation.latitude},${this.currentLocation.longitude}&zoom=13&maptype=roadmap`;
    
    return url;
  }

  buildStreetViewUrl(): string {
    if (!this.currentLocation) return '';
    
    // Construir URL de Street View 360°
    const url = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&location=${this.currentLocation.latitude},${this.currentLocation.longitude}&heading=0&pitch=0&fov=90`;
    
    return url;
  }

  toggleStreetView() {
    this.showStreetView = !this.showStreetView;
    
    if (this.showStreetView && this.currentLocation) {
      // Usar el visor de Street View sin API key
      const streetViewUrlString = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${this.currentLocation.latitude},${this.currentLocation.longitude}&heading=-45&pitch=0&fov=80`;
      this.streetViewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(streetViewUrlString);
    }
  }

  loadUserLocations() {
    // Cargar ubicaciones desde localStorage
    const stored = localStorage.getItem('ubicuidado_user_locations');
    if (stored) {
      this.userLocations = JSON.parse(stored).map((loc: any) => ({
        ...loc,
        timestamp: new Date(loc.timestamp)
      }));
    }
  }

  saveUserLocations() {
    localStorage.setItem('ubicuidado_user_locations', JSON.stringify(this.userLocations));
  }

  async registrarUbicacion() {
    if (!this.registroForm.nombre.trim()) {
      this.registroError = 'Por favor ingresa tu nombre';
      return;
    }

    if (!this.registroForm.comentario.trim()) {
      this.registroError = 'Por favor ingresa un comentario';
      return;
    }

    if (!this.currentLocation) {
      this.registroError = 'No se pudo obtener tu ubicación';
      return;
    }

    this.registrando = true;
    this.registroError = '';

    try {
      const newLocation: UserLocation = {
        id: Date.now().toString(),
        nombre: this.registroForm.nombre.trim(),
        comentario: this.registroForm.comentario.trim(),
        latitude: this.currentLocation.latitude,
        longitude: this.currentLocation.longitude,
        timestamp: new Date()
      };

      this.userLocations.unshift(newLocation);
      this.saveUserLocations();

      this.registroSuccess = '¡Ubicación registrada exitosamente!';
      this.registroForm = { nombre: '', comentario: '' };

      setTimeout(() => {
        this.registroSuccess = '';
      }, 3000);

    } catch (error) {
      this.registroError = 'Error al registrar la ubicación';
    } finally {
      this.registrando = false;
    }
  }

  eliminarUbicacion(id: string) {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      this.userLocations = this.userLocations.filter(loc => loc.id !== id);
      this.saveUserLocations();
    }
  }

  verEnMapa(latitude: number, longitude: number) {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Justo ahora';
  }
}
