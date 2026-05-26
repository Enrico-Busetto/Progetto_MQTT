const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

let lista_prep = [];
let lista_finito = [];

document.addEventListener('DOMContentLoaded', () => {
    client.on('connect', () => console.log("Subscriber connesso al Broker!"));

    // Gestione processi
    setInterval(() => {
        if(lista_prep.length > 0) {
            lista_finito.push(lista_prep.shift());
            renderLists();
        }
    }, 7000);

    // Gestione Iscrizione
    document.getElementById('btnSub').addEventListener('click', () => {
        const topic = document.getElementById('topicSub').value;
        if(topic) {
            client.subscribe(topic);
            console.log("Iscritto a:", topic);
        } else {
            alert("Inserisci un topic!");
        }
    });

    // Ricezione Messaggi
    client.on('message', (topic, message) => {
        lista_prep.push({ topic, message: message.toString() });
        renderLists();
    });
});

// Funzione unificata per aggiornare la UI
function renderLists() {
    const sectionPrep = document.getElementById("listaPrep");
    const sectionFinito = document.getElementById("listaFinito");

    sectionPrep.innerHTML = lista_prep.map(item => 
        `<p><b>${item.topic}:</b> ${item.message}</p>`).join('');
    
    sectionFinito.innerHTML = lista_finito.map(item => 
        `<p><b>${item.topic}:</b> ${item.message}</p>`).join('');
}
