const client = mqtt.connect('ws://127.0.0.1:9001/mqtt');
let ordine = [];
let costo = 0;
let matrix_id = Math.floor(Math.random() * 900) + 100;

function aggiungi(nome, prezzo) {
    let duplicato = false;
    for(let i=0; i<ordine.length && !duplicato; i++){
        if(ordine[i].nome == nome){
            ordine[i].quantita++;
            duplicato = true;
        }
    }
    if(!duplicato){
        ordine.push({ nome: nome, prezzo: prezzo, quantita: 1});
    }
    costo += prezzo;
    creaToast(`Hai aggiunto ${nome}`,"toast-aggiunta");
}

window.creaToast = function(txt,classe){
    const container = document.getElementById("toast-container");
    const nuovoToast = document.createElement("div");
    nuovoToast.classList.add(classe);
    
    nuovoToast.innerHTML = txt;

    container.appendChild(nuovoToast);

    setTimeout(() => {
        nuovoToast.remove();
    }, 3000);
}


window.remove = function(indice){
    creaToast(`Hai rimosso dal tuo ordine ${ordine[indice].nome}`,"toast-rimozione");

    ordine[indice].quantita--;
    costo -= ordine[indice].prezzo;
    if(ordine[indice].quantita == 0){
        ordine.splice(indice,1);
    }
    caricaPaginaPagamento();
} 

window.caricaPaginaPagamento = function (){
    const container = document.getElementById("contenuto");

    container.classList.remove("home-banner");

    let listaProdottiHTML = "";

    if (ordine.length === 0) {
        listaProdottiHTML = "<p style='text-align:center;'>Il tuo carrello è vuoto</p>";
    }
    else{
        for(let i=0;i<ordine.length;i++){

            listaProdottiHTML += `
                <div class="item-carrello">
                    <span>X ${ordine[i].quantita} ${ordine[i].nome}</span>
                    <span>${ordine[i].prezzo}€</span>
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

            <div class="totale-carrello">
                <span>Conto Totale:</span>
                <span>${costo}€</span>
            </div>
            <div class="tooltip-wrapper" id="wrapper-pagamento" data-tooltip="Aggiungi dei prodotti al carrello per pagare!">
                <button class="pulsante-paga" onclick="mandaPagamento()" id="btnPagamento">
                    Paga e Invia Ordine
                </button>
            </div>
        </div>
    `;

    if(ordine.length == 0){
        document.getElementById("btnPagamento").disabled = true;
    }

}

window.mandaPagamento = function(){
    if (client.connected) {
        const pacchettoDati = {
            id: matrix_id,
            prodotti: ordine,
            prezzo: costo,
        };
        
        client.publish("Ordini",JSON.stringify(pacchettoDati));
        
        //Notifica quando abbiamo mandato il nostro ordine
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.classList.add("toast-ritiro");
        toast.innerHTML = `Abbiamo mandato il tuo ordine numero : ${matrix_id}`;
        toast.id = `toast-ordine-${matrix_id}`;
        container.appendChild(toast);
            
        //Reset 
        matrix_id++;
        ordine = [];
        costo = 0;
        //Notifica quando è pronto il nostro ordine
        ordineRicevuto();

        document.getElementById("contenuto").innerHTML = `<h1>Grazie per aver ordinato</h1>`;
    }
    else {
        creaToast("Non sei ancora connesso al broker!","toast-error");
    }
}

window.ordineRicevuto = function(){
    client.removeAllListeners("message");
    client.on("message", (topic, message) => {
        if (topic === "Finito") {
            const msg = JSON.parse(message);
            if (msg && msg.id) {
                const toast = document.getElementById(`toast-ordine-${msg.id}`);

                toast.innerHTML=`
                <div>
                    L'ordine ${msg.id} è pronto per il ritiro 
                    <button class ="toast-button" onclick=ritiraOrdine(${msg.id})>Ritira Ordine</button>
                </div>`;
        }
    }
    });
}

window.ritiraOrdine = function(id){
    console.log(id);
    const toast = document.getElementById(`toast-ordine-${id}`);
    toast.remove();
    const dati = { id: id };
    client.publish("Ritirato",JSON.stringify(dati));
}


document.addEventListener('DOMContentLoaded', (event) => {
    client.on('connect', (event) => {
        console.log("Publisher connesso al Broker!");
        client.subscribe("Finito");
        }
    );

    document.getElementById("mostraMenu").addEventListener('click',(event)=>{
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
            </div>`;
});

    

    document.getElementById("mostraPagamento").addEventListener('click', (event) => {
        event.preventDefault();
        caricaPaginaPagamento();
        
    }); 
});