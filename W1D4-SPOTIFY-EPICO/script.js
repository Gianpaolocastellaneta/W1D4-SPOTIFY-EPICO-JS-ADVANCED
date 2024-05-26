// Funzione per aggiungere i dati nella pagina HTML
function addAlbumsToPage(data, elementId) {
  const outputElement = document.getElementById(elementId); // Trova l'elemento HTML con l'ID "elementId"
  outputElement.innerHTML = ''; // Svuota qualsiasi contenuto precedente

  // Se non trova nulla mi restituisce il paragrafo
  if (data.length === 0) {
    outputElement.innerHTML = '<p>No results found</p>';
    return;
  }

  // Set per evitare duplicati di album
  const albumSet = new Set();

  data.forEach(track => { // Itera attraverso ogni traccia nei dati
    if (!albumSet.has(track.album.id)) { // Controlla se l'album non è già stato aggiunto
      albumSet.add(track.album.id); // Aggiunge l'ID dell'album al Set

      //Creo la card con Copertina, titolo, nome dell'artista e button x modale
      const albumElement = document.createElement('div');
      albumElement.classList.add('col-md-3', 'mb-4'); // Usa col-md-3 per avere 4 colonne per riga
      albumElement.innerHTML = `
        <div class="card h-100 d-flex flex-column">
          <img src="${track.album.cover_medium}" class="card-img-top rounded mx-auto d-block mt-2" alt="${track.album.title}">
          <div class="card-body flex-grow-1">
            <h5 class="card-title text-center">${track.album.title}</h5>
            <p class="card-text text-center ont-italic">Artista: ${track.artist.name}</p>
          </div>
          <div class="card-footer mt-auto">
            <button class="btn btn-dark" onclick="showAlbumDetails(${track.album.id})">Mostra Album</button>
          </div>
        </div>
      `;

      //Aggiungo la Card a id albumElement su html
      outputElement.appendChild(albumElement);
    }
  });
}

// Funzione per recuperare i dati dalla chiamata Fetch
async function fetchData(artist) {
  try {
    // Fa una richiesta all'API con il nome dell'artista
    const response = await fetch(`https://striveschool-api.herokuapp.com/api/deezer/search?q=${artist}`);
    if (!response.ok) {
      throw new Error('La risposta non è ok: ' + response.statusText); // Se la risposta non è OK, lancia un errore
    }
    const data = await response.json(); // Converte la risposta in formato JSON

    // Verifico con console.log che ci sono i dati della chiamata
    console.log(data);

    // Nascondo l'output delle card-random
    document.getElementById('random-output').style.display = 'none';

    // Converto i dati dell'oggetto in json da far apparire
    addAlbumsToPage(data.data, 'output'); // Passa i dati alla funzione "addAlbumsToPage" per visualizzarli
  } catch (error) {
    console.error('Si è verificato un problema con l\'operazione di recupero: ', error); // Mostra un errore se qualcosa va storto
  }
}

// Funzione per ottenere album random
async function fetchRandomAlbums() {
  try {
    // Fa una richiesta all'API con all finale per prendere un po di artisti 
    const response = await fetch('https://striveschool-api.herokuapp.com/api/deezer/search?q=all');
    if (!response.ok) {
      throw new Error('La risposta non è ok: ' + response.statusText); // Se la risposta non è OK, lancia un errore
    }
    const data = await response.json(); // Converte la risposta in formato JSON

    // Verifico con console.log che ci sono i dati della chiamata
    console.log(data);

    // Mostra una selezione random di album (ad esempio, i primi 20)
    const randomAlbums = data.data.sort(() => 0.5 - Math.random()).slice(0, 20);

    // Converto i dati dell'oggetto in json da far apparire
    addAlbumsToPage(randomAlbums, 'random-output');
  } catch (error) {
    console.error('Si è verificato un problema con l\'operazione di recupero: ', error);
  }
}

// Funzione di ricerca
function search() {
  const query = document.getElementById('searchField').value; // Prende il valore dell'input di ricerca il nome dell'artista da cercare
  if (query) { // Se trova qualcosa nella ricerca dell'input, chiama "fetchData"
    fetchData(query);
  }
}

// Aggiungi un evento click al pulsante di ricerca
document.getElementById('button-search').addEventListener('click', search);

// Funzione per mostrare i dati dell'album nella modale
async function showAlbumDetails(albumId) {
  try {
    const response = await fetch(`https://striveschool-api.herokuapp.com/api/deezer/album/${albumId}`);
    if (!response.ok) {
      throw new Error('La risposta non è ok: ' + response.statusText);
    }
    const albumData = await response.json();
    console.log(albumData);

    // Aggiungi i dettagli dell'album nella modale 
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
      <h3 class="text-center">Album: ${albumData.title}</h3>
      <h6 class="text-center">Artista: ${albumData.artist.name}</h6>
      <p class="text-center">Data pubblicazione: ${albumData.release_date}</p>
      <img src="${albumData.cover_medium}" class="rounded mx-auto d-block mb-3" alt="${albumData.title}">
      <ul class="list-group">
        ${albumData.tracks.data.map(track => `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            ${track.title}
            <span class="badge badge-primary badge-pill">${formatDuration(track.duration)}</span>
          </li>
        `).join('')}
      </ul>
    `;

    // Mostra la modale
    $('#albumModal').modal('show');
  } catch (error) {
    console.error('There has been a problem with your fetch operation: ', error);
  }
}

// Funzione per formattare la durata delle canzoni in minuti e secondi
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);  // Calcola i minuti
  const secs = seconds % 60; // Calcola i secondi rimanenti
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`; // Restituisce la durata formattata come "minuti:secondi"
}

// Recupera e mostra album random al caricamento della pagina
document.addEventListener('DOMContentLoaded', fetchRandomAlbums);
