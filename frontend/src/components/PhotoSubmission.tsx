import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useWallet } from "@solana/wallet-adapter-react";
import { api } from "../lib/api";
import bs58 from "bs58";

interface PhotoSubmissionProps {
  roundId: string;
  onSuccess: () => void;
}

export const PhotoSubmission: React.FC<PhotoSubmissionProps> = ({
  roundId,
  onSuccess,
}) => {
  const { publicKey, signMessage } = useWallet();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
  });

  const handleSubmit = async () => {
    if (!preview || !publicKey || !signMessage) {
      setError("Please connect your wallet and select a photo");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Sign message
      const message = `Submit find for $FIND\nRound: ${roundId}\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);
      const signature = bs58.encode(signatureBytes);

      // Submit photo
      await api.submitPhoto({
        signature,
        message,
        walletAddress: publicKey.toBase58(),
        photoBase64: preview,
        roundId,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit photo");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-600 p-8 rounded-lg text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="font-heading text-3xl mb-2">Submission Successful!</h3>
        <p className="text-white">
          Your find has been submitted for review. Good luck!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-secondary p-6 rounded-lg border-2 border-gold">
      <h3 className="font-heading text-2xl mb-4 text-gold text-center">
        🎯 YOU'RE THE HIGHEST HOLDER! SUBMIT YOUR FIND
      </h3>

      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-4 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-gold bg-gold/10"
              : "border-gray-500 hover:border-gold"
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">📸</div>
          <p className="text-lg mb-2">
            {isDragActive
              ? "Drop your photo here..."
              : "Drag & drop your find photo here"}
          </p>
          <p className="text-sm text-gray-400">or click to browse</p>
          <p className="text-xs text-gray-500 mt-2">JPG or PNG, max 10MB</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-96 object-contain bg-black rounded-lg"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Change Photo
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={uploading || !publicKey}
            className="w-full bg-gold text-black font-bold py-4 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
          >
            {uploading ? "Submitting..." : "Submit Find"}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-600/20 border border-red-600 text-red-400 p-3 rounded">
          {error}
        </div>
      )}

      {!publicKey && (
        <div className="mt-4 bg-yellow-600/20 border border-yellow-600 text-yellow-400 p-3 rounded text-center">
          Please connect your wallet to submit
        </div>
      )}
    </div>
  );
};
