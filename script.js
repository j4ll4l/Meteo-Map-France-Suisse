// Initialisation de la carte Leaflet
let map = L.map("map").setView([46.6, 2.5], 7);

// Ajout d'un fond de carte OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//Creation de un gruope de Markers pour pouvoir les gérer
let markerGroup = L.layerGroup().addTo(map);

/**
 * Fonction permettant de récupérer les informations météorologiques 
 * pour une localisation donnée (latitude, longitude) ou une ville.
 * 
 * @param {number} lat - Latitude de la position à récupérer.
 * @param {number} lng - Longitude de la position à récupérer.
 * @param {string} city - Nom de la ville détectée.
 * @returns {string} - Contenu HTML structuré pour afficher la météo dans un popup.
 */
// Fonction pour récupérer la météo
async function fetchWeather(lat, lng, city) {
  try {
    const meteoRequest = await fetch(
      `https://www.prevision-meteo.ch/services/json/lat=${lat}lng=${lng}`
    );
    const dataMeteo = await meteoRequest.json();
    console.log("Données météo :", dataMeteo);


    //Recupere les informatoins et le stocker dans des variables
    const condition = dataMeteo.current_condition.condition;
    const temperature = dataMeteo.current_condition.tmp;
    const hour = dataMeteo.current_condition.hour;
    const jour_date = dataMeteo.current_condition.date;
    const pressure = dataMeteo.current_condition.pressure;
    const humidity = dataMeteo.current_condition.humidity;
    const wind = `${dataMeteo.current_condition.wnd_spd} / ${dataMeteo.current_condition.wnd_dir}`;
    const city_name = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();



    // Contenu du popup
    const popupContent = `
      <!-- WIDGET -->
      <div class="card mb-3 m-0 border-0" style="width: 13rem;">
          <!-- HEAD TITRE -->
          <div id="head_card" class="card-body">
              <h5 class="card-title text-center display-6"  style="font-weight:bold;">${city_name}</h5>
          </div>
          <!-- INFO BASE JOUR -->
          <div id="card-group" class="card-body d-flex p-0">
              <div id="icon" class="card pb-3 pt-0" style="width: 50%; border: 0px;">
                  <img src="https://prevision-meteo.ch/style/images/icon/ensoleille-big.png" class="mb-2" width="100px"
                      alt="Rapresentation Meteo">
                  <h6 class="card-subtitle mb-2 text-body-secondary ps-3"> ${condition}</h6>
              </div>
      
              <div id="infojour" class="card p-0 text-center" style="width: 50%; border: 0px;">
                  <h5 class="card-title" style="font-weight:bold;">Lundi</h5>
                  <p class="card-text text-body-secondary m-0 mb-2"><small>${jour_date}</small></p>
                  <p class="card-text p-0 m-0" style="font-weight:bold; font-size: x-large;">${temperature}° C</p>
                  <p class="card-text text-body-secondary"><small>Heure: ${hour}</small></p>
              </div>
          </div>
          <!-- INFO SPEC. JOURN -->
          <div id="footer_card" class="card-body pt-0">
              <hr>
              <p class="card-text">Pressure : <span style="font-weight:700;"> ${pressure} hPa</span></p>
              <p class="card-text">Humidité : <span style="font-weight:700;"> ${humidity} %</span></p>
              <p class="card-text">Speed/Direction vent : <span style="font-weight:700;"> ${wind}</span></p>
          </div>
      </div>
    `;

    return popupContent;


  } catch (error) {
    console.error("Problème sur la requête météo :", error);
  }
}



/**
 * Fonction permettant de récupérer le nom de la ville en fonction des coordonnées GPS
 * et d'afficher un marqueur avec les informations météorologiques.
 * 
 * @param {Object} e - Événement de clic sur la carte contenant les coordonnées (latitude et longitude).
 */
async function fetchCity(e) {
  const lat = e.latlng.lat.toFixed(3);
  const lng = e.latlng.lng.toFixed(3);
  try {
    const cityRequest = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=geojson`
    );
    const dataCity = await cityRequest.json();
    console.log("Données ville :", dataCity);

    // Récupération du nom de la ville
    const city = (
      dataCity.features[0]?.properties?.address?.town ||
      dataCity.features[0]?.properties?.address?.municipality ||
      dataCity.features[0]?.properties?.address?.village ||
      "inconnue"
    ).toLowerCase();

    console.log("Ville détectée :", city);

    // Appelle la météo avec la ville détectée
    const popupContent = await fetchWeather(lat, lng, city);

    let marker = L.marker(e.latlng).addTo(markerGroup);
    marker.bindPopup(popupContent).openPopup();


  } catch (error) {
    console.error("Problème sur la requête ville :", error);
  }
}

// Gestion du clic sur la carte
map.on("click", function (e) {
  markerGroup.clearLayers();
  console.log("Latitude:", e.latlng.lat, "Longitude:", e.latlng.lng);
  fetchCity(e);
});

