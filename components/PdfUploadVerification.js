"use client";
import { useState, useRef } from 'react';
import blockchainService from '@/lib/blockchainService';

export default function PdfUploadVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const fileInputRef = useRef(null);

  // Contract address
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await blockchainService.initialize(CONTRACT_ADDRESS);
      if (success) {
        setIsConnected(true);
      } else {
        throw new Error('Failed to connect to MetaMask');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResult(null);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('pdfFile', file);

      const response = await fetch('/api/verify-uploaded-pdf', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadResult(result);
      console.log('PDF uploaded and hash calculated:', result);

    } catch (error) {
      setError(error.message);
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyUploadedPdf = async () => {
    if (!uploadResult || !uploadResult.hash) {
      setError('No PDF hash available for verification');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.verifyDocument(uploadResult.hash);
      setVerificationResult(result);
      console.log('Verification result:', result);
    } catch (error) {
      setError(error.message);
      console.error('Verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerUploadedPdf = async () => {
    if (!uploadResult || !uploadResult.hash) {
      setError('No PDF hash available for registration');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await blockchainService.registerDocument(uploadResult.hash);
      setVerificationResult(result);
      console.log('Registration result:', result);
    } catch (error) {
      setError(error.message);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setUploadResult(null);
    setVerificationResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h2 className="text-xl font-semibold text-gray-900">PDF Upload & Verification</h2>
      </div>

      {/* Connection Status */}
      <div className="mb-4">
        {isConnected ? (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected to MetaMask</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Not connected to MetaMask</span>
          </div>
        )}
      </div>

      {/* Connect Wallet Button */}
      {!isConnected && (
        <div className="mb-6">
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      )}

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload PDF File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        <p className="mt-1 text-xs text-gray-500">
          Maximum file size: 10MB. Only PDF files are accepted.
        </p>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">PDF Uploaded Successfully</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>Filename:</strong> {uploadResult.filename}</div>
            <div><strong>Size:</strong> {(uploadResult.size / 1024).toFixed(2)} KB</div>
            <div><strong>Hash:</strong> <span className="font-mono text-xs break-all">{uploadResult.hash}</span></div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {uploadResult && isConnected && (
        <div className="mb-6 space-y-2">
          <button
            onClick={verifyUploadedPdf}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify on Blockchain'}
          </button>
          
          <button
            onClick={registerUploadedPdf}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Registering...' : 'Register on Blockchain'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Verification Result */}
      {verificationResult && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Verification Result</h3>
          <div className="text-sm space-y-1">
            <div>Status: 
              <span className={`ml-1 font-medium ${verificationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.isValid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            {verificationResult.registeredAt && (
              <div>Registered: <span className="font-mono text-xs">{verificationResult.registeredAt}</span></div>
            )}
            {verificationResult.transactionHash && (
              <div>Transaction: <span className="font-mono text-xs break-all">{verificationResult.transactionHash}</span></div>
            )}
            {verificationResult.message && (
              <div className="text-gray-600">{verificationResult.message}</div>
            )}
          </div>
        </div>
      )}

      {/* Clear Button */}
      {(uploadResult || verificationResult || error) && (
        <button
          onClick={clearResults}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Clear Results
        </button>
      )}

      {/* Instructions */}
      <div className="mt-6 text-xs text-gray-500">
        <p className="mb-2">
          <strong>How to use:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Connect your MetaMask wallet</li>
          <li>Upload any PDF file you want to verify</li>
          <li>Click "Verify on Blockchain" to check if it's registered</li>
          <li>Click "Register on Blockchain" to store its hash</li>
          <li>Any modification to the PDF will change its hash and be detected</li>
        </ul>
      </div>
    </div>
  );
}
