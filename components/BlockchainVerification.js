"use client";
import { useState, useEffect } from 'react';
import blockchainService from '@/lib/blockchainService';

export default function BlockchainVerification({ documentHash, onVerificationComplete }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);

  // Contract address (you'll need to deploy the contract and get this address)
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  const checkMetaMaskConnection = async () => {
    if (blockchainService.isMetaMaskAvailable()) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          
          // Initialize blockchain service
          await blockchainService.initialize(CONTRACT_ADDRESS);
          
          // Get network info
          const network = await blockchainService.getNetworkInfo();
          setNetworkInfo(network);
        }
      } catch (error) {
        console.error('Error checking MetaMask connection:', error);
      }
    }
  };

  const connectMetaMask = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!blockchainService.isMetaMaskAvailable()) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      const success = await blockchainService.initialize(CONTRACT_ADDRESS);
      if (success) {
        setIsConnected(true);
        const currentAccount = await blockchainService.getCurrentAccount();
        setAccount(currentAccount);
        
        const network = await blockchainService.getNetworkInfo();
        setNetworkInfo(network);
      } else {
        throw new Error('Failed to connect to MetaMask');
      }
    } catch (error) {
      setError(error.message);
      console.error('MetaMask connection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerDocument = async () => {
    if (!documentHash) {
      setError('No document hash available');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.registerDocument(documentHash);
      setVerificationResult(result);
      
      if (onVerificationComplete) {
        onVerificationComplete(result);
      }
      
      console.log('Document registered:', result);
    } catch (error) {
      setError(error.message);
      console.error('Document registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDocument = async () => {
    if (!documentHash) {
      setError('No document hash available');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await blockchainService.verifyDocument(documentHash);
      setVerificationResult(result);
      
      if (onVerificationComplete) {
        onVerificationComplete(result);
      }
      
      console.log('Document verified:', result);
    } catch (error) {
      setError(error.message);
      console.error('Document verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      42161: 'Arbitrum One',
      421614: 'Arbitrum Sepolia',
      31337: 'Hardhat Local'
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-900">Blockchain Verification</h3>
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

      {/* Account and Network Info */}
      {isConnected && account && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div>Account: <span className="font-mono">{formatAddress(account)}</span></div>
            {networkInfo && (
              <div>Network: <span className="font-medium">{getNetworkName(networkInfo.chainId)}</span></div>
            )}
          </div>
        </div>
      )}

      {/* Document Hash */}
      {documentHash && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-900">
            <div className="font-medium mb-1">Document Hash:</div>
            <div className="font-mono text-xs break-all">{documentHash}</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isConnected ? (
          <button
            onClick={connectMetaMask}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <>
            <button
              onClick={registerDocument}
              disabled={isLoading || !documentHash}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register on Blockchain'}
            </button>
            
            <button
              onClick={verifyDocument}
              disabled={isLoading || !documentHash}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify Document'}
            </button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Verification Result */}
      {verificationResult && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-2">Verification Result:</div>
            <div className="space-y-1">
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
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="mb-2">
          <strong>How it works:</strong>
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Connect your MetaMask wallet</li>
          <li>Register your document hash on the blockchain</li>
          <li>Verify document integrity anytime</li>
          <li>Any modification will change the hash and be detected</li>
        </ul>
      </div>
    </div>
  );
}
