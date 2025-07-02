// src/components/Dashboard/Wallet/SuccessPaymentDialog.tsx

import { useEffect, useRef, useState } from 'react';
import { useWalletStore } from '@/store/walletStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

const SuccessPaymentDialog = () => {
  const { wallet } = useWalletStore();
  const lastTx = wallet?.transactions?.[0];
  const [open, setOpen] = useState(false);
  const prevTxStatusRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      lastTx &&
      typeof window !== 'undefined'
    ) {
      const wasShown = sessionStorage.getItem(`tx-${lastTx.id}-shown`);

      // Only show if it changed from not completed to completed
      if (
        lastTx.status === 'completed' &&
        prevTxStatusRef.current !== 'completed' &&
        !wasShown
      ) {
        setOpen(true);
        sessionStorage.setItem(`tx-${lastTx.id}-shown`, '1');
      }

      // Update ref after check
      prevTxStatusRef.current = lastTx.status;
    }
  }, [lastTx?.id, lastTx?.status]);

  const closeDialog = () => setOpen(false);

  if (!lastTx || lastTx.status !== 'completed') return null;

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="border border-green-700/40 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Payment Successful
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-white/80">
          You have successfully funded your wallet with:
        </div>

        <div className="text-4xl font-bold text-green-300 text-center font-mono py-3">
          ₦{lastTx.amount.toLocaleString()}
        </div>

        <div className="bg-green-500/10 text-green-300/90 text-xs px-3 py-2 rounded-md border border-green-500/20 mb-3 text-center">
          Your wallet has been updated and is ready for use.
        </div>

        <DialogFooter>
          <button
            onClick={closeDialog}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition"
          >
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessPaymentDialog;
