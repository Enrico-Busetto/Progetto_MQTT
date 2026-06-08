const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

let lista_prep = [];
let lista_finito = [];

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
    client.on('connect', () => console.log("Subscriber connesso al Broker Pubblico!"));
    
    const TOPIC_ORDINI = "Ordini";
    const TOPIC_RITIRATO = "Ritirato";
    const TOPIC_PRONTO = "OrdinePronto";
    const TOPIC_FINITO = "Finito";

    
    client.subscribe(TOPIC_ORDINI);
    client.subscribe(TOPIC_RITIRATO);
    client.subscribe(TOPIC_PRONTO);

    setInterval(cambiaPubblicita, 10000);

    setInterval(() => {
        if (lista_prep.length > 0) {
            renderLists();
        }
    }, 1000);

    client.on('message', (topic, message) => {
        const msg = JSON.parse(message.toString());
        
        if (topic === TOPIC_ORDINI) {
            if (!msg.orarioInizio) {
                msg.orarioInizio = Date.now();
            }
            lista_prep.push(msg);
            renderLists();
        }
        
        else if (topic === TOPIC_PRONTO) {
            let index = lista_prep.findIndex(ordine => ordine.id == msg.id);

            if (index !== -1) {
                let ordineDaSpostare = lista_prep.splice(index, 1)[0];
                
                let orarioInizioReale = msg.orarioInizio || ordineDaSpostare.orarioInizio;
                
                let tempoImpiegato = Math.floor((Date.now() - orarioInizioReale) / 1000);
                
                ordineDaSpostare.tempoTotale = tempoImpiegato;
                ordineDaSpostare.ritardato = (tempoImpiegato >= 15);
                
                lista_finito.push(ordineDaSpostare);
                renderLists();
                mandaOrdineFinito(); 
            }
        }
        
        else if (topic === TOPIC_RITIRATO) {
            let index = lista_finito.findIndex(ordine => ordine.id == msg.id);
            if (index !== -1) {
                lista_finito.splice(index, 1);
                renderLists();
            }
        }
    });

    function mandaOrdineFinito() {
        if (lista_finito.length > 0) {
            let str = JSON.stringify(lista_finito[lista_finito.length - 1]);
            client.publish(TOPIC_FINITO, str);
        }
    }

    function renderLists() {
        const listaPrepEl = document.getElementById("listaPrep");
        const listaFinitoEl = document.getElementById("listaFinito");
        
        if (listaPrepEl) listaPrepEl.innerHTML = creaContenuto(lista_prep, true);
        if (listaFinitoEl) listaFinitoEl.innerHTML = creaContenuto(lista_finito, false);
    }

    function creaContenuto(lista, isPrep) {
        return lista.map(item => {
            let timerHTML = "";
            let classeRitardo = "";

            if (isPrep) {
                let secondiPassati = Math.floor((Date.now() - item.orarioInizio) / 1000);
                
                if (secondiPassati >= 15) {
                    classeRitardo = "ritardo";
                }
                timerHTML = `<p class="timer-live">In prep: <b>${secondiPassati}s</b></p>`;
            } else {
                if (item.ritardato === true) {
                    classeRitardo = "ritardo";
                }
                timerHTML = `<p class="timer-finito">Pronto in: ${item.tempoTotale}s</p>`;
            }

            return `
                <div class="ordine-box ${classeRitardo}">
                    <h3>Ordine numero: ${item.id}</h3>
                    <p>Prodotti: ${item.prodotti.map(p => p.quantita + " X " + p.nome).join(", ")}</p>
                    ${timerHTML}
                </div>
            `;
        }).join('');
    }
});