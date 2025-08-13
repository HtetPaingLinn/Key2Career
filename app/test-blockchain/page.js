"use client";
import { useState } from 'react';
import blockchainService from '@/lib/blockchainService';

export default function TestBlockchain() {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  const testConnection = async () => {
    setStatus('Testing connection...');
    setError('');
    setResult('');

    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      console.log('Contract address:', contractAddress);
      
      const success = await blockchainService.initialize(contractAddress);
      
      if (success) {
        setStatus('Connected successfully!');
        
        // Test contract functions
        const testHash = "test123";
        const exists = await blockchainService.contract.documentExists(testHash);
        setResult(`Contract test successful. documentExists("${testHash}"): ${exists}`);
      } else {
        setError('Failed to connect');
      }
    } catch (err) {
      setError(err.message);
      console.error('Test error:', err);
    }
  };

  const testRegister = async () => {
    setStatus('Testing registration...');
    setError('');
    setResult('');

    try {
      const testHash = "test" + Date.now();
      const result = await blockchainService.registerDocument(testHash);
      setResult(`Registration successful: ${JSON.stringify(result, null, 2)}`);
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Blockchain Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Test Connection
          </button>
        </div>
        
        <div>
          <button 
            onClick={testRegister}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Test Registration
          </button>
        </div>
        
        {status && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <strong>Status:</strong> {status}
          </div>
        )}
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <strong>Result:</strong> 
            <pre className="mt-2 text-sm overflow-auto">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
