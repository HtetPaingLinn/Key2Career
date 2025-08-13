import PdfUploadVerification from '@/components/PdfUploadVerification';

export default function PdfVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PDF Tamper Detection
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload any PDF file to verify its integrity against the blockchain. 
            Detect if the document has been modified since it was registered.
          </p>
        </div>

        {/* Main Component */}
        <PdfUploadVerification />

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            How Blockchain Tamper Detection Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Document Registration</h3>
              <p className="text-sm text-gray-600">
                When you register a PDF, its SHA-256 hash is stored on the blockchain. 
                This creates an immutable record of the document's exact content.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Integrity Verification</h3>
              <p className="text-sm text-gray-600">
                To verify a document, we calculate its current hash and compare it 
                with the hash stored on the blockchain. Any difference indicates tampering.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. Cryptographic Security</h3>
              <p className="text-sm text-gray-600">
                SHA-256 is a cryptographic hash function that produces a unique 
                64-character string for each unique document. Even a single bit change 
                creates a completely different hash.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">4. Blockchain Immutability</h3>
              <p className="text-sm text-gray-600">
                Once stored on the blockchain, the hash cannot be altered or deleted. 
                This provides permanent proof of the document's original state.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Use Cases</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Verify the authenticity of important documents</li>
              <li>Detect unauthorized modifications to contracts</li>
              <li>Ensure CV/resume integrity during job applications</li>
              <li>Validate academic certificates and transcripts</li>
              <li>Protect legal documents from tampering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
