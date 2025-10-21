// Type definitions for Google Maps JavaScript API
interface Window {
  google: typeof google;
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: HTMLElement, opts?: MapOptions);
    setCenter(latLng: LatLng | LatLngLiteral): void;
    setZoom(zoom: number): void;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(latLng: LatLng | LatLngLiteral): void;
    setMap(map: Map | null): void;
  }

  interface MapOptions {
    zoom?: number;
    center?: LatLng | LatLngLiteral;
    mapTypeId?: string;
    disableDefaultUI?: boolean;
    zoomControl?: boolean;
    mapTypeControl?: boolean;
    scaleControl?: boolean;
    streetViewControl?: boolean;
    fullscreenControl?: boolean;
    styles?: any[];
  }

  interface MarkerOptions {
    position?: LatLng | LatLngLiteral;
    map?: Map;
    title?: string;
    animation?: any;
    icon?: string | Icon | Symbol;
    optimized?: boolean;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface Icon {
    url: string;
    size?: Size;
    scaledSize?: Size;
    origin?: Point;
    anchor?: Point;
  }

  interface Symbol {
    path: any;
    fillColor?: string;
    fillOpacity?: number;
    strokeColor?: string;
    strokeWeight?: number;
    rotation?: number;
    scale?: number;
    anchor?: Point;
  }

  interface Size {
    width: number;
    height: number;
  }

  interface Point {
    x: number;
    y: number;
  }

  const Animation: {
    DROP: number;
    BOUNCE: number;
  };

  const SymbolPath: {
    CIRCLE: string;
    BACKWARD_CLOSED_ARROW: string;
    FORWARD_CLOSED_ARROW: string;
  };

  class Point {
    constructor(x: number, y: number);
  }
}
