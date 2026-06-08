const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

let ordine = [];
let costo = 0;
let matrix_id = Math.floor(Math.random() * 900) + 100;

let valutaSelezionata = "EUR";
let prezzoConvertito = 0;
let simboloValuta = "€";

function aggiungi(nome, prezzo) {
    let duplicato = false;

    for (let i = 0; i < ordine.length && !duplicato; i++) {
        if (ordine[i].nome == nome) {
            ordine[i].quantita++;
            duplicato = true;
        }
    }

    if (!duplicato) {
        ordine.push({
            nome: nome,
            prezzo: prezzo,
            quantita: 1
        });
    }

    costo += prezzo;
    costo = Number(costo.toFixed(2));

    creaToast(`Hai aggiunto ${nome}`, "toast-aggiunta");
}

window.creaToast = function (txt, classe) {
    const container = document.getElementById("toast-container");

    const nuovoToast = document.createElement("div");
    nuovoToast.classList.add(classe);
    nuovoToast.innerHTML = txt;

    container.appendChild(nuovoToast);

    setTimeout(() => {
        nuovoToast.remove();
    }, 3000);
}

window.remove = function (indice) {
    creaToast(`Hai rimosso dal tuo ordine ${ordine[indice].nome}`, "toast-rimozione");

    ordine[indice].quantita--;
    costo -= ordine[indice].prezzo;
    costo = Number(costo.toFixed(2));

    if (ordine[indice].quantita == 0) {
        ordine.splice(indice, 1);
    }

    caricaPaginaPagamento();
}

function simboloDaValuta(valuta) {
    if (valuta === "EUR") return "€";
    if (valuta === "USD") return "$";
    if (valuta === "GBP") return "£";
    return valuta;
}

function aggiornaTotale(prezzo, simbolo, valuta) {
    const prezzoTotale = document.getElementById("prezzoTotale");
    const infoValuta = document.getElementById("infoValuta");

    if (prezzoTotale) {
        prezzoTotale.innerHTML = `${prezzo.toFixed(2)} ${simbolo}`;
    }

    if (infoValuta) {
        if (valuta === "EUR") {
            infoValuta.innerHTML = "Prezzo base in euro";
        } else {
            infoValuta.innerHTML = `Convertito da EUR a ${valuta} tramite API online`;
        }
    }
}

function aggiornaBottoneValuta() {
    const bottoni = document.querySelectorAll(".btn-valuta");

    bottoni.forEach(btn => {
        btn.classList.remove("valuta-attiva");

        if (btn.dataset.valuta === valutaSelezionata) {
            btn.classList.add("valuta-attiva");
        }
    });
}

window.convertiValuta = async function (valuta) {
    valutaSelezionata = valuta;

    if (costo === 0) {
        prezzoConvertito = 0;
        simboloValuta = simboloDaValuta(valuta);
        aggiornaTotale(0, simboloValuta, valuta);
        aggiornaBottoneValuta();
        return 0;
    }

    if (valuta === "EUR") {
        prezzoConvertito = costo;
        simboloValuta = "€";

        aggiornaTotale(prezzoConvertito, simboloValuta, valuta);
        aggiornaBottoneValuta();

        return prezzoConvertito;
    }

    try {
        const risposta = await fetch(
            `https://api.frankfurter.dev/v1/latest?base=EUR&symbols=${valuta}`
        );

        if (!risposta.ok) {
            throw new Error("Errore nella risposta della API");
        }

        const dati = await risposta.json();

        if (!dati.rates || !dati.rates[valuta]) {
            throw new Error("Valuta non trovata");
        }

        const tasso = dati.rates[valuta];

        prezzoConvertito = costo * tasso;
        simboloValuta = simboloDaValuta(valuta);

        aggiornaTotale(prezzoConvertito, simboloValuta, valuta);
        aggiornaBottoneValuta();

        return prezzoConvertito;
    }
    catch (error) {
        console.log(error);
        creaToast("Errore nella conversione valuta", "toast-error");

        prezzoConvertito = costo;
        simboloValuta = "€";

        aggiornaTotale(costo, "€", "EUR");
        aggiornaBottoneValuta();

        return costo;
    }
}

window.caricaPaginaPagamento = function () {
    const container = document.getElementById("contenuto");

    container.classList.remove("home-banner");

    let listaProdottiHTML = "";

    if (ordine.length === 0) {
        listaProdottiHTML = "<p style='text-align:center;'>Il tuo carrello è vuoto</p>";
    }
    else {
        for (let i = 0; i < ordine.length; i++) {
            listaProdottiHTML += `
                <div class="item-carrello">
                    <span>X ${ordine[i].quantita} ${ordine[i].nome}</span>
                    <span>${ordine[i].prezzo.toFixed(2)}€</span>
                </div>

                <button class="btn_remover" onclick="remove(${i})">
                    RIMUOVI
                </button>

                <br><br>
            `;
        }
    }

    container.innerHTML = `
        <div class="box-carrello">

            <h3>Riepilogo Ordine</h3>

            <div id="riepilogo-prodotti">
                ${listaProdottiHTML}
            </div>

            <div class="cambio-valuta">
                <button class="btn-valuta" data-valuta="EUR" onclick="convertiValuta('EUR')">
                    EUR €
                </button>

                <button class="btn-valuta" data-valuta="USD" onclick="convertiValuta('USD')">
                    USD $
                </button>

                <button class="btn-valuta" data-valuta="GBP" onclick="convertiValuta('GBP')">
                    GBP £
                </button>
            </div>

            <div class="totale-carrello">
                <span>Conto Totale:</span>
                <span id="prezzoTotale">${costo.toFixed(2)} €</span>
            </div>

            <p id="infoValuta" class="info-valuta">
                Prezzo base in euro
            </p>

            <div class="tooltip-wrapper" id="wrapper-pagamento" data-tooltip="Aggiungi dei prodotti al carrello per pagare!">
                <button class="pulsante-paga" onclick="mandaPagamento()" id="btnPagamento">
                    Paga e Invia Ordine
                </button>
            </div>

        </div>
    `;

    if (ordine.length == 0) {
        document.getElementById("btnPagamento").disabled = true;
    }

    convertiValuta(valutaSelezionata);
}

window.mandaPagamento = async function () {
    if (client.connected) {
        if (ordine.length === 0) {
            creaToast("Non hai ancora ordinato niente", "toast-error");
            return;
        }

        await convertiValuta(valutaSelezionata);

        const pacchettoDati = {
            id: matrix_id,
            prodotti: ordine,
            prezzo: costo,
            prezzoEuro: costo,
            prezzoConvertito: Number(prezzoConvertito.toFixed(2)),
            valuta: valutaSelezionata
        };

        client.publish("Ordini", JSON.stringify(pacchettoDati));

        const container = document.getElementById("toast-container");

        const toast = document.createElement("div");
        toast.classList.add("toast-ritiro");
        toast.innerHTML = `Abbiamo mandato il tuo ordine numero: ${matrix_id}`;
        toast.id = `toast-ordine-${matrix_id}`;

        container.appendChild(toast);

        matrix_id++;
        ordine = [];
        costo = 0;
        prezzoConvertito = 0;
        valutaSelezionata = "EUR";
        simboloValuta = "€";

        ordineRicevuto();

        document.getElementById("contenuto").innerHTML = `<h1>Grazie per aver ordinato</h1>`;
    }
    else {
        creaToast("Non sei ancora connesso al broker!", "toast-error");
    }
}

window.ordineRicevuto = function () {
    client.removeAllListeners("message");

    client.on("message", (topic, message) => {
        if (topic === "Finito") {
            const msg = JSON.parse(message.toString());

            if (msg && msg.id) {
                const toast = document.getElementById(`toast-ordine-${msg.id}`);

                if (toast) {
                    toast.innerHTML = `
                        <div>
                            L'ordine ${msg.id} è pronto per il ritiro 
                            <button class="toast-button" onclick="ritiraOrdine(${msg.id})">
                                Ritira Ordine
                            </button>
                        </div>
                    `;
                }
            }
        }
    });
}

window.ritiraOrdine = function (id) {
    const toast = document.getElementById(`toast-ordine-${id}`);

    if (toast) {
        toast.remove();
    }

    const dati = {
        id: id
    };

    client.publish("Ritirato", JSON.stringify(dati));

    creaToast("L'ordine è stato ritirato, buon appetito", "toast-ritiro");
}

document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => {
        console.log("Publisher connesso al Broker!");
        client.subscribe("Finito");
    });

    document.getElementById("mostraMenu").addEventListener('click', (event) => {
        event.preventDefault();

        const container = document.getElementById("contenuto");

        container.classList.remove("home-banner");

        container.innerHTML = `
            <div class="sezione-menu">
                <h2 class="titolo-sezione">PANINI</h2>

                <div class="griglia-menu">

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Classico.png">
                        <h3>Classico - 7,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Classico', 7.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Crunch.png">
                        <h3>Crunch - 9,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Crunch', 9.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Golden.png">
                        <h3>Golden - 10,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Golden', 10.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/SmashDoppio.png">
                        <h3>Smash Doppio - 11,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Smash', 11.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Smoke.png">
                        <h3>Smoke - 12,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Smoke', 12.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Iconic.png">
                        <h3>Iconic - 13,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Iconic', 13.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Wild.png">
                        <h3>Wild - 12,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Wild', 12.50)">AGGIUNGI</button>
                    </div>

                </div>
            </div>

            <div class="sezione-menu">
                <h2 class="titolo-sezione">BIBITE</h2>

                <div class="griglia-menu">

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Acqua.png">
                        <h3>Acqua 0,5L - 1,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Acqua', 1.50)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Bibite.png">
                        <h3>Bibita a scelta - 3,00€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Bibite', 3.00)">AGGIUNGI</button>
                    </div>

                    <div class="voce-menu">
                        <img class="immaggini" src="images/Birra.png">
                        <h3>Birra alla spina 0,3L - 4,50€</h3>
                        <button class="pulsante-aggiungi" onclick="aggiungi('Birra', 4.50)">AGGIUNGI</button>
                    </div>

                </div>
            </div>
        `;
    });

    document.getElementById("mostraPagamento").addEventListener('click', (event) => {
        event.preventDefault();
        caricaPaginaPagamento();
    });
});