import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { ICONS } from '../constants';

interface ScannerViewProps {
  onScanSuccess: (decodedText: string) => void;
  onBack: () => void;
}

const QR_READER_ID = 'qr-reader'; // Use the same ID as before to reuse styles

const ScannerView: React.FC<ScannerViewProps> = ({ onScanSuccess, onBack }) => {
  const [manualBoxId, setManualBoxId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  
  // Use a ref to hold the scanner instance to avoid re-initialization
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    // This check is important to prevent re-initialization
    if (!html5QrCodeRef.current) {
        const qrCode = new Html5Qrcode(QR_READER_ID);
        html5QrCodeRef.current = qrCode;

        const qrCodeSuccessCallback = (decodedText: string) => {
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop()
              .then(() => {
                onScanSuccess(decodedText.toUpperCase());
                html5QrCodeRef.current = null; // Mark as cleaned up
              })
              .catch(err => {
                console.error("Failed to stop scanner after success", err);
                onScanSuccess(decodedText.toUpperCase()); // Proceed anyway
                html5QrCodeRef.current = null;
              });
          }
        };

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        };

        qrCode.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => { /* ignore parse errors */ }
        ).catch((err) => {
          console.error("Unable to start scanning.", err);
          if (err.name === 'NotAllowedError') {
             setScanError("Camera permission denied. Please allow camera access in your browser settings.");
          } else {
             setScanError("Could not start camera. Please check permissions or ensure another app isn't using it.");
          }
        });
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(err => {
          // This can be noisy if the scanner is already stopped, so we can ignore.
        });
        html5QrCodeRef.current = null;
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBoxId.trim()) {
      onScanSuccess(manualBoxId.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-primary hover:underline">
        {ICONS.back}
        <span>Dashboard</span>
      </button>

      <div className="bg-base-800 p-4 rounded-lg border border-base-700 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Scan QR Code</h2>
        <p className="text-gray-400 mb-4">Point your camera at the box's QR code.</p>
        <div 
          id={QR_READER_ID} 
          className="w-full max-w-sm mx-auto rounded-lg overflow-hidden aspect-square bg-base-900"
        />
        {scanError && <p className="text-error mt-4">{scanError}</p>}
      </div>

      <div className="bg-base-800 p-4 rounded-lg border border-base-700 space-y-3">
        <h3 className="text-lg font-semibold text-white text-center">Or Enter Box ID Manually</h3>
        <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <input
                type="text"
                value={manualBoxId}
                onChange={(e) => setManualBoxId(e.target.value)}
                placeholder="e.g., BOX-12345"
                className="w-full px-3 py-2 bg-base-900 border border-base-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Enter Box ID Manually"
                required
            />
            <button type="submit" className="bg-primary text-white p-2.5 rounded-md hover:bg-accent transition-colors shrink-0" aria-label="Submit Box ID">
                {ICONS.go}
            </button>
        </form>
      </div>

    </div>
  );
};

export default ScannerView;