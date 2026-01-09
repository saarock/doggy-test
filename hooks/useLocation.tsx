"use client"

import { useEffect, useState } from "react";

export default function useLocation() {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    // Get user's location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported")
            return
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
                setLocationError(null)
            },
            (error) => {
                setLocationError("Unable to get location")
                console.error(error)
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, []);

    return { location, locationError }
}