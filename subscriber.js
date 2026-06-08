const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

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
    
    setInterval(cambiaPubblicita, 10000);

    setInterval(() => {
        if (lista_prep.length > 0) {
            renderLists();
        }
    }, 1000);
    
    client.on('message', (topic, message) => {
        const msg = JSON.parse(message.toString());
        
        if(topic == "Ordini"){
            msg.orarioInizio = Date.now(); 
            
            lista_prep.push(msg);
            renderLists();
            tempo_random = generaTempoRandomico();

            setTimeout(() => {
                if(lista_prep.length > 0) {
                    let ordineDaSpostare = lista_prep.shift();

                    let tempoImpiegato = Math.floor((Date.now() - ordineDaSpostare.orarioInizio) / 1000);
                    ordineDaSpostare.tempoTotale = tempoImpiegato;

                    if (tempoImpiegato >= 15) {
                        ordineDaSpostare.ritardato = true;
                    } else {
                        ordineDaSpostare.ritardato = false;
                    }

                    lista_finito.push(ordineDaSpostare);
                    renderLists();
                    mandaOrdineFinito();
                    cambiaPubblicita();
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
    document.getElementById("listaPrep").innerHTML = creaContenuto(lista_prep, true);
    document.getElementById("listaFinito").innerHTML = creaContenuto(lista_finito, false);
}

function creaContenuto(lista, isPrep){
    return lista.map(item => {
        let timerHTML = "";
        let classeRitardo = "";

        if(isPrep) {
            let secondiPassati = Math.floor((Date.now() - item.orarioInizio) / 1000);
            
            if(secondiPassati >= 15) {
                classeRitardo = "ritardo";
            }
            
            timerHTML = `<p class="timer-live">In prep: <b>${secondiPassati}s</b></p>`;
        } else {
            if(item.ritardato === true) {
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

function generaTempoRandomico(){
    return (Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000);
}