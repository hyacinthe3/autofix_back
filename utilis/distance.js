const haversine = (coord1, coord2) => {
    const R = 6371; // Earth radius in km
    const lat1 = coord1.lat * (Math.PI / 180);
    const lat2 = coord2.lat * (Math.PI / 180);
    const dLat = lat2 - lat1;
    const dLon = (coord2.lon - coord1.lon) * (Math.PI / 180);
  
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };
  
  export default haversine;
  