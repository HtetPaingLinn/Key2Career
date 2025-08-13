// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocRegistry {
    struct Document {
        string hash;
        uint256 timestamp;
        address owner;
        bool exists;
    }
    
    // Mapping from document hash to document info
    mapping(bytes32 => Document) public documents;
    
    // Events
    event DocumentRegistered(bytes32 indexed hash, string hashString, uint256 timestamp, address owner);
    event DocumentVerified(bytes32 indexed hash, bool isValid);
    
    /**
     * @dev Register a document hash on-chain
     * @param _hash The SHA-256 hash of the document
     */
    function registerDocument(string memory _hash) public {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        
        require(!documents[hashBytes].exists, "Document already registered");
        
        documents[hashBytes] = Document({
            hash: _hash,
            timestamp: block.timestamp,
            owner: msg.sender,
            exists: true
        });
        
        emit DocumentRegistered(hashBytes, _hash, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Verify if a document hash exists on-chain
     * @param _hash The SHA-256 hash to verify
     * @return isValid True if document is registered and unchanged
     */
    function verifyDocument(string memory _hash) public view returns (bool isValid) {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        Document memory doc = documents[hashBytes];
        
        isValid = doc.exists && keccak256(abi.encodePacked(doc.hash)) == hashBytes;
        
        return isValid;
    }
    
    /**
     * @dev Get document information
     * @param _hash The SHA-256 hash to look up
     * @return hash The stored hash
     * @return timestamp When it was registered
     * @return owner Who registered it
     * @return exists Whether it exists
     */
    function getDocument(string memory _hash) public view returns (
        string memory hash,
        uint256 timestamp,
        address owner,
        bool exists
    ) {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        Document memory doc = documents[hashBytes];
        
        return (doc.hash, doc.timestamp, doc.owner, doc.exists);
    }
    
    /**
     * @dev Check if document exists
     * @param _hash The SHA-256 hash to check
     * @return True if document is registered
     */
    function documentExists(string memory _hash) public view returns (bool) {
        bytes32 hashBytes = keccak256(abi.encodePacked(_hash));
        return documents[hashBytes].exists;
    }
}
