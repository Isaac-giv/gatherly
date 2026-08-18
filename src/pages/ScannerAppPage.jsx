import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, CheckCircle2, AlertTriangle, XCircle, Camera, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

export const ScannerAppPage = () => {
  const [scanResult, setScanResult] = useState(null);
  const [manualHash, setManualHash] = useState('GTH-TICKET-EVT_101-USR_ATT_1');
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, []);

  const startCameraScanner = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setIsScanning(false);
          // Try parsing JSON or raw hash
          try {
            const parsed = JSON.parse(decodedText);
            verifyTicketHash(parsed.hash || decodedText);
          } catch {
            verifyTicketHash(decodedText);
          }
        },
        (error) => {
          // Scan frame error - silent retry
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const verifyTicketHash = async (hashToValidate) => {
    if (!hashToValidate) return;
    setIsVerifying(true);

    try {
      const res = await fetch('/api/checkin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeHash: hashToValidate })
      });

      const data = await res.json();
      setScanResult(data);
      setIsVerifying(false);

      setScanHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          hash: hashToValidate,
          valid: data.valid,
          status: data.status,
          message: data.message,
          ticket: data.ticket
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      setIsVerifying(false);
      setScanResult({ valid: false, status: 'ERROR', message: 'Connection error while validating ticket' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <QrCode className="w-4 h-4 text-emerald-400" /> Dedicated Organizer Entry Scanner
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">QR Code Check-in Microservice</h1>
        <p className="text-slate-400 text-xs max-w-lg mx-auto">
          Scan attendee QR codes via mobile browser camera or enter cryptographic ticket hashes for instant anti-double-spend entry validation.
        </p>
      </div>

      {/* Main Scanner Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Live Camera & Scanner Interface */}
        <div className="md:col-span-7 space-y-6">
          
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 bg-slate-900/90 shadow-2xl space-y-6 text-center">
            
            {!isScanning ? (
              <div className="space-y-6 py-6">
                <div className="w-24 h-24 rounded-full bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                  <Camera className="w-12 h-12 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Webcam / Mobile Camera Scan</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Click below to enable your browser camera feed for real-time QR ticket code scanning.
                  </p>
                </div>

                <button
                  onClick={startCameraScanner}
                  className="px-6 py-3.5 rounded-2xl glow-button text-white font-bold text-sm inline-flex items-center gap-2 shadow-xl shadow-indigo-600/40"
                >
                  <Camera className="w-4 h-4" /> Launch Camera Scanner View
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div id="reader" className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-indigo-500/50" />
                <button
                  onClick={() => {
                    if (scannerRef.current) scannerRef.current.clear();
                    setIsScanning(false);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel Camera Scan
                </button>
              </div>
            )}

            {/* Manual Hash Validation Box */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <label className="text-xs font-semibold text-slate-300 block text-left">
                Manual Hash / Quick Code Input
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste or enter QR hash code..."
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => verifyTicketHash(manualHash)}
                  disabled={isVerifying}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 whitespace-nowrap"
                >
                  {isVerifying ? 'Verifying...' : 'Validate Entry'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Scan Result Feedback & Log */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Scan Status Feedback Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-4">
            <h3 className="font-display font-bold text-base text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Validation Status Feedback
            </h3>

            {!scanResult ? (
              <div className="p-6 text-center text-slate-400 text-xs font-medium space-y-2">
                <QrCode className="w-8 h-8 mx-auto text-slate-600" />
                <p>Awaiting QR Code Scan...</p>
              </div>
            ) : scanResult.valid ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-300 space-y-2 text-center animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-extrabold text-lg text-emerald-300">{scanResult.message}</h4>
                {scanResult.ticket && (
                  <p className="text-xs text-slate-300">Pass: <strong className="text-white">{scanResult.ticket.ticketTierName}</strong> • {scanResult.ticket.eventTitle}</p>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500 text-rose-300 space-y-2 text-center">
                <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h4 className="font-extrabold text-base text-rose-300">{scanResult.message}</h4>
                <p className="text-[11px] text-slate-400">Entry rejected to prevent double-spending.</p>
              </div>
            )}
          </div>

          {/* History Feed */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Recent Entry Scan Log</h4>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
              {scanHistory.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No scan history recorded yet.</p>
              ) : (
                scanHistory.map(item => (
                  <div key={item.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className={`font-bold ${item.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.valid ? 'VALIDATED' : 'REJECTED'}
                      </span>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{item.hash}</p>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
