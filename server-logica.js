const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

const TOPIC_ORDINI = "Ordini";
const TOPIC_PRONTO = "OrdinePronto";

client.on('connect', () => {
    console.log("Regista della Logica Centrale Connesso al Broker Pubblico!");
    client.subscribe(TOPIC_ORDINI);
});

client.on('message', async (topic, message) => {
    if (topic == TOPIC_ORDINI) {
        const ordineRicevuto = JSON.parse(message.toString());
        console.log(`Logica: Ricevuto ordine #${ordineRicevuto.id}`);

        if (!ordineRicevuto.orarioInizio) {
            let timestampInizio = Date.now(); 
            try {
                const response = await fetch("https://timeapi.io/api/Time/current/zone?timeZone=Europe/Rome");
                if (response.ok) {
                    const dataTime = await response.json();
                    timestampInizio = dataTime.unixtime * 1000; 
                }
            } catch (error) {
                console.warn("API irraggiungibile, uso l'ora locale.");
            }
            ordineRicevuto.orarioInizio = timestampInizio;
        }

        let tempoRandom = Math.floor(Math.random() * (20000 - 1000 + 1)) + 1000;
        console.log(`L'ordine #${ordineRicevuto.id} sarà pronto tra ${tempoRandom / 1000}s`);

        setTimeout(() => {
            let payloadSblocco = {
                id: ordineRicevuto.id,
                orarioInizio: ordineRicevuto.orarioInizio
            };

            client.publish(TOPIC_PRONTO, JSON.stringify(payloadSblocco));
            console.log(`Logica: Tempo scaduto. Inviato segnale Pronto per ordine #${ordineRicevuto.id}`);
        }, tempoRandom);
    }
});