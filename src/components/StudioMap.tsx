// src/components/StudioMap.tsx

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Studio } from "@/types";
import Link from "next/link";
import { Button } from "./ui/button";

// Fix for default Leaflet markers in Next.js/React
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface StudioMapProps {
  studios: Studio[];
}

export default function StudioMap({ studios }: StudioMapProps) {
  // Default center (US center-ish or New York)
  const defaultCenter: [number, number] = [40.7128, -74.0060];
  
  // Calculate center based on studios if available
  const center: [number, number] = studios.length > 0 && studios[0].latitude && studios[0].longitude
    ? [studios[0].latitude!, studios[0].longitude!] 
    : defaultCenter;

  return (
    <MapContainer 
      center={center} 
      zoom={11} 
      scrollWheelZoom={false} 
      className="h-[calc(100vh-12rem)] w-full rounded-lg z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {studios.map((studio) => {
        if (!studio.latitude || !studio.longitude) return null;
        
        return (
          <Marker 
            key={studio.id} 
            position={[studio.latitude, studio.longitude]}
            icon={icon}
          >
            <Popup className="min-w-[200px]">
              <div className="flex flex-col gap-2">
                <div className="w-full h-24 bg-muted rounded-md overflow-hidden">
                    <img src={studio.coverImage} alt={studio.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">{studio.name}</h3>
                    <p className="text-xs text-muted-foreground">{studio.location}</p>
                </div>
                <Link href={`/studios/${studio.id}`} className="w-full">
                    <Button size="sm" className="w-full h-8 text-xs">View Studio</Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}