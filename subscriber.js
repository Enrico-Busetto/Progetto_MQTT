const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');

let lista_prep = [];
let lista_finito = [];
let tempo_random = generaTempoRandomico();

// Logica Pubblicità
const ads = ["images/promo.png", "images/promo2.png", "images/promo3.png"];
let adIndex = 0;

function cambiaPubblicita() {
    const banner = document.getElementById("banner-ad");
    if (banner) {
        adIndex = (adIndex + 1) % ads.length;
        banner.src = ads[adIndex];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    client.on('connect', () => console.log("Subscriber connesso al Broker!"));
    client.subscribe("Ordini");
    client.subscribe("Ritirato");
    
    // Rotazione automatica ogni 10 secondi
    setInterval(cambiaPubblicita, 10000);
    
    client.on('message', (topic, message) => {
        const msg = JSON.parse(message.toString());
        
        if(topic == "Ordini"){
            lista_prep.push(msg);
            renderLists();
            
            setTimeout(() => {
                if(lista_prep.length > 0) {
                    lista_finito.push(lista_prep.shift());
                    renderLists();
                    mandaOrdineFinito();
                    cambiaPubblicita(); // Cambia adv quando l'ordine è pronto
                    tempo_random = generaTempoRandomico();
                }
            }, tempo_random);
        }
        else if(topic == "Ritirato"){
            let index = lista_finito.findIndex(ordine => ordine.id == msg.id);
            if (index !== -1) {
                lista_finito.splice(index, 1);
                renderLists();
            }
        }
    });
});

function mandaOrdineFinito(){
    let str = JSON.stringify(lista_finito[lista_finito.length - 1]);
    client.publish("Finito", str);
}

function renderLists() {
    document.getElementById("listaPrep").innerHTML = creaContenuto(lista_prep);
    document.getElementById("listaFinito").innerHTML = creaContenuto(lista_finito);
}

function creaContenuto(lista){
    return lista.map(item => `
        <div class="ordine-box">
            <h3>Ordine numero: ${item.id}</h3>
            <p>Prodotti: ${item.prodotti.map(p => p.quantita + " X " + p.nome).join(", ")}</p>
        </div>
    `).join('');
}

function generaTempoRandomico(){
    return (Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000);
}
