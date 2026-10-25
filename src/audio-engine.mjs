import { getStation } from './stations.mjs';

export class SignalEngine {
  constructor() { this.context = null; this.node = null; this.active = false; }

  async start({ now, durationMinutes, volume, wave, channel = 'both', deviceId, advanceMs, stationId = 'dcf77', onComplete, onInterrupt }) {
    const context = new AudioContext({ sampleRate: 48000, latencyHint: 'interactive' });
    this.context = context;
    try {
      if (deviceId !== 'default') {
        if (!context.setSinkId) throw new Error('Audio output selection is not supported. Use the system default.');
        await context.setSinkId(deviceId);
      }
      await context.audioWorklet.addModule(new URL('./signal-worklet.mjs', import.meta.url));
      await context.resume();
      if (context.state !== 'running') throw new Error('Audio output is unavailable.');
      if (context.sampleRate <= getStation(stationId).audioFrequency * 2) throw new Error('The output sample rate is too low for this station.');
      // Let the output clock become available; compensate the reported device latency.
      await new Promise(resolve => setTimeout(resolve, 100));
      const stamp = context.getOutputTimestamp?.();
      const latency = (context.baseLatency || 0) + (context.outputLatency || 0);
      const epochAtZero = stamp?.contextTime > 0 && stamp?.performanceTime > 0
        ? now(stamp.performanceTime) - stamp.contextTime * 1000 + advanceMs
        : now() - context.currentTime * 1000 + latency * 1000 + advanceMs;
      const audibleNow = epochAtZero + context.currentTime * 1000;
      const startEpoch = Math.ceil(audibleNow / 1000) * 1000 + 1000;
      const firstFullMinute = Math.ceil(startEpoch / 60000) * 60000;
      // End only at a minute boundary, after the selected number of complete frames.
      const endEpoch = firstFullMinute + durationMinutes * 60000;
      this.node = new AudioWorkletNode(context, 'dcf77', {
        numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2],
        processorOptions: { epochAtZero, startEpoch, endEpoch, volume, wave, channel, stationId },
      });
      this.node.onprocessorerror = () => { if (this.active) onInterrupt('The audio engine stopped. Restart the session.'); };
      this.node.port.onmessage = ({ data }) => { if (data.type === 'complete' && this.active) onComplete(); };
      this.node.connect(context.destination);
      this.active = true;
      context.onstatechange = () => {
        if (this.active && context.state !== 'running') onInterrupt('Audio output was suspended. Restart the session.');
      };
      return { startEpoch, endEpoch, firstFullMinute, sampleRate: context.sampleRate, latencyMs: Math.round(latency * 1000) };
    } catch (error) { await this.stop(); throw error; }
  }

  setVolume(value) { this.node?.port.postMessage({ type: 'volume', value }); }

  async stop() {
    this.active = false;
    if (this.node) { this.node.disconnect(); this.node.port.close(); this.node = null; }
    if (this.context) {
      this.context.onstatechange = null;
      if (this.context.state !== 'closed') await this.context.close();
      this.context = null;
    }
  }
}

export async function testOutput(deviceId = 'default', channel = 'both') {
  const context = new AudioContext({ sampleRate: 48000 });
  try {
    if (deviceId !== 'default') {
      if (!context.setSinkId) throw new Error('Audio output selection is not supported.');
      await context.setSinkId(deviceId);
    }
    await context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 440;
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, context.currentTime + 0.03);
    gain.gain.setValueAtTime(0.08, context.currentTime + 0.9);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 1);
    oscillator.connect(gain);
    // Explicit stereo routing, with no pan-law attenuation on the active side.
    const merger = context.createChannelMerger(2);
    merger.channelInterpretation = 'discrete';
    if (channel !== 'right') gain.connect(merger, 0, 0);
    if (channel !== 'left') gain.connect(merger, 0, 1);
    merger.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 1);
    await new Promise(resolve => { oscillator.onended = resolve; });
  } finally { if (context.state !== 'closed') await context.close(); }
}
