import "./Map.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const Map = ({ locations }) => {
  console.log(locations);
  return (
    <section>
      <MapContainer
        // center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}
        className="map"
        bounds={locations.map((location) => [
          location.coordinates[1],
          location.coordinates[0],
        ])}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location) => (
          <Marker
            key={location._id}
            position={[location.coordinates[1], location.coordinates[0]]}
          >
            <Popup>
              Day {location.day}: {location.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
};

export default Map;
