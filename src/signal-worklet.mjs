import { getStation, stationFrameAt, audioEnvelope } from './stations.mjs';

// Audio-clock scheduling runs independently of renderer timers and UI activity.
class TimeSignalProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const config = options.processorOptions;
    this.epochAtZero = config.epochAtZero;
    this.startEpoch = config.startEpoch;
    this.endEpoch = config.endEpoch;
    this.volume = config.volume;
    this.wave = config.wave;
    this.channel = config.channel || 'both';
    this.station = getStation(config.stationId || 'dcf77');
    this.phase = 0;
    this.frame = null;
    this.ended = false;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'volume') this.volume = Math.max(0, Math.min(0.8, data.value));
    };
  }

  process(_inputs, outputs) {
    const channels = outputs[0];
    for (let i = 0; i < channels[0].length; i++) {
      const epoch = this.epochAtZero + (currentTime + i / sampleRate) * 1000;
      let sample = 0;
      if (epoch >= this.startEpoch && epoch < this.endEpoch) {
        const cycle = this.station.cycle * 1000;
        const start = Math.floor(epoch / cycle) * cycle;
        if (!this.frame || this.frame.start !== start) this.frame = stationFrameAt(this.station.id, epoch);
        const second = Math.floor((epoch - start) / 1000);
        const fraction = (epoch % 1000) / 1000;
        const carrier = this.wave === 'square' ? (this.phase < Math.PI ? 1 : -1) : Math.sin(this.phase);
        const fade = Math.min(1, (epoch - this.startEpoch) / 5, (this.endEpoch - epoch) / 5);
        sample = carrier * audioEnvelope(this.frame, second, fraction, this.wave) * this.volume * fade;
      }
      this.phase = (this.phase + 2 * Math.PI * this.station.audioFrequency / sampleRate) % (2 * Math.PI);
      for (let c = 0; c < channels.length; c++) {
        const enabled = this.channel === 'both' || (this.channel === 'left' && c === 0) || (this.channel === 'right' && c === 1);
        channels[c][i] = enabled ? sample : 0;
      }
      if (epoch >= this.endEpoch && !this.ended) {
        this.ended = true;
        this.port.postMessage({ type: 'complete' });
      }
    }
    return !this.ended;
  }
}
registerProcessor('dcf77', TimeSignalProcessor);
