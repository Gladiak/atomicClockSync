const dgram = require('node:dgram');
const dns = require('node:dns').promises;
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const NTP_EPOCH = 2208988800;
const ERA = 2 ** 32;
const SERVERS = ['ptbtime1.ptb.de', 'ptbtime2.ptb.de', 'time.cloudflare.com'];

function readTimestamp(packet, offset, reference = Date.now()) {
  const seconds = packet.readUInt32BE(offset);
  const fraction = packet.readUInt32BE(offset + 4) / ERA;
  const era = Math.round(((reference / 1000 + NTP_EPOCH) - seconds) / ERA);
  return (seconds + era * ERA - NTP_EPOCH + fraction) * 1000;
}

function parseReply(packet, nonce, t1, t4) {
  if (packet.length < 48) throw new Error('Risposta NTP incompleta');
  const mode = packet[0] & 7;
  const version = (packet[0] >> 3) & 7;
  if (mode !== 4 || version < 3 || version > 4 || packet[0] >> 6 === 3) throw new Error('Server NTP non sincronizzato');
  if (packet[1] < 1 || packet[1] > 15) throw new Error('Strato NTP non valido');
  if (!packet.subarray(24, 32).equals(nonce)) throw new Error('Risposta NTP non corrispondente');
  const t2 = readTimestamp(packet, 32, t1);
  const t3 = readTimestamp(packet, 40, t1);
  if (packet.subarray(32, 40).every(b => b === 0) || packet.subarray(40, 48).every(b => b === 0)) throw new Error('Timestamp NTP nullo');
  const delay = (t4 - t1) - (t3 - t2);
  if (t3 < t2 || delay < -5 || delay > 2500) throw new Error('Latenza NTP eccessiva');
  const dispersion = packet.readUInt32BE(8) / 65536 * 1000;
  const offsetMs = ((t2 - t1) + (t3 - t4)) / 2;
  return { offsetMs, rttMs: Math.max(0, delay), uncertaintyMs: Math.max(1, delay / 2 + dispersion), stratum: packet[1] };
}

async function queryNtp(host, timeoutMs = 3000) {
  // Resolve first, then require both the expected peer and the echoed random nonce.
  const { address } = await dns.lookup(host, { family: 4 });
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    const packet = Buffer.alloc(48);
    packet[0] = 0x23; // client, NTPv4
    const nonce = crypto.randomBytes(8);
    nonce.copy(packet, 40);
    const t1 = Date.now();
    const mono = performance.now();
    let done = false;
    const finish = (error, value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      socket.close();
      error ? reject(error) : resolve(value);
    };
    const timer = setTimeout(() => finish(new Error('Timeout NTP')), timeoutMs);
    socket.on('error', error => finish(error));
    socket.on('message', (reply, peer) => {
      if (peer.address !== address || peer.port !== 123) return;
      const t4 = t1 + performance.now() - mono;
      try {
        finish(null, { ...parseReply(reply, nonce, t1, t4), host, epochMs: t4, monotonicMs: performance.now() });
      } catch (error) { finish(error); }
    });
    socket.send(packet, 123, address, error => { if (error) finish(error); });
  });
}

async function synchronize() {
  // Bound DNS resolution as well as UDP, so unavailable networks never stall the UI.
  const results = await Promise.allSettled(SERVERS.map(host => Promise.race([
    queryNtp(host), new Promise((_, reject) => { const t = setTimeout(() => reject(new Error('Timeout DNS/NTP')), 4500); t.unref(); }),
  ])));
  const valid = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  if (!valid.length) throw new Error('Server NTP non raggiungibili. Controlla la connessione o usa l’ora del computer.');
  // Multiple disagreeing servers must not silently produce an authoritative time.
  const agreeing = valid.length === 1 ? valid : valid.filter(a => valid.some(b => a !== b && Math.abs(a.offsetMs - b.offsetMs) < 1000));
  if (!agreeing.length) throw new Error('I server orari non concordano. Riprova tra poco.');
  const best = agreeing.sort((a, b) => a.uncertaintyMs - b.uncertaintyMs)[0];
  return { ...best, synchronizedAt: Date.now(), checkedServers: valid.length };
}

module.exports = { readTimestamp, parseReply, queryNtp, synchronize, SERVERS };
