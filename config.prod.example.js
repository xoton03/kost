// K.O.S.T. Production Configuration Template
// Copy this file to config.prod.js on your hosting server or write it via deploy scripts.
window.KostConfig = window.KostConfig || {};

// Only populate if not already set by config.js (local overrides)
if (!window.KostConfig.SUPABASE_URL) {
    window.KostConfig.SUPABASE_URL = "https://jphzmgscxpejcyjlnspq.supabase.co";
}
if (!window.KostConfig.SUPABASE_KEY) {
    window.KostConfig.SUPABASE_KEY = "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";
}
if (!window.KostConfig.GAS_URL) {
    window.KostConfig.GAS_URL = "https://script.google.com/macros/s/AKfycbyLTx3UJtcZ96MNOYq7Kdkm8BDcOYzu-gLOkFDALPpdzrGmsKsUx_IdOZenLq8a0AdM-w/exec";
}
