import mongoose from 'mongoose';

const vpnServerSchema = new mongoose.Schema({
  country: { type: String, required: true },
  flag: { type: String, default: '' },
  ip: { type: String, required: true },
  speed: { type: String, required: true },
  link: { type: String, required: true },
  bool: { type: Boolean, default: true },
  countryShort: { type: String, required: true },
  ipClean: { type: String, required: true },
  speedMbps: { type: Number, required: true },
  ping: { type: Number, required: true },
  score: { type: Number, required: true },
  hostName: { type: String, required: true },
  // Expiry TTL index: auto-deletes servers after 30 minutes if the cron sync breaks
  createdAt: { type: Date, default: Date.now, expires: 1800 }
});

export const VpnServerModel = mongoose.model('VpnServer', vpnServerSchema);
