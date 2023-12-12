// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { ethers, JsonRpcProvider, JsonRpcSigner } from 'ethers';
import ArtCollectible from './ArtCollectible.json';

// Define the contract address for Polygon Mumbai
const contractAddress = '0x765676292b9D1E789250B29BF61AACCf4a9ECe48';

interface NFT {
  tokenId: number;
  imageUrl: string;
  // Add other properties based on your NFT metadata
}

const NFTGallery: React.FC = () => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [tokenId, setTokenId] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const claimNFT = async () => {
    try {
      // Connect to the Polygon Mumbai provider
      const provider: JsonRpcProvider = new ethers.JsonRpcProvider(
        'https://sly-white-energy.matic-testnet.quiknode.pro/d20feac5fd286b5c19ff6bc82c9b63aa2fa6352e/'
      );

      // Get the contract instance
      const contract = new ethers.Contract(contractAddress, ArtCollectible.abi, provider);

      // Call the mint function on the contract
      setLoading(true);
      const tx = await contract.mint(tokenId, 1); // Assuming minting 1 NFT
      await tx.wait();
      setLoading(false);
      setTransactionHash(tx.hash);
    } catch (error) {
      setLoading(false);
      setError(`Error claiming NFT: ${(error as Error)?.message}`);
    }
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // Connect to the Polygon Mumbai provider
        const provider: JsonRpcProvider = new ethers.JsonRpcProvider(
          'https://sly-white-energy.matic-testnet.quiknode.pro/d20feac5fd286b5c19ff6bc82c9b63aa2fa6352e/'
        );

        // Get the contract instance
        const contract = new ethers.Contract(contractAddress, ArtCollectible.abi, provider);

        // Call the totalSupply function to get the total number of minted NFTs
        const totalSupply = await contract.totalSupply();

        // Fetch metadata for each NFT
        const fetchedNFTs: NFT[] = [];
        for (let i = 0; i < totalSupply; i++) {
          const tokenId = await contract.tokenByIndex(i);
          const tokenUri = await contract.tokenURI(tokenId);
          const response = await fetch(tokenUri);
          const metadata = await response.json();

          fetchedNFTs.push({
            tokenId: tokenId.toNumber(),
            imageUrl: metadata.image,
            // Add other properties based on your NFT metadata
          });
        }

        setNFTs(fetchedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Error fetching NFTs');
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div>
      <h1>NFT Gallery</h1>
      <div>
        {nfts.map((nft) => (
          <div key={nft.tokenId} style={{ marginBottom: '20px' }}>
            <img src={nft.imageUrl} alt={`NFT ${nft.tokenId}`} style={{ width: '200px', height: '200px' }} />
            <div>
              <button onClick={() => setTokenId(nft.tokenId)}>Claim NFT {nft.tokenId}</button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <label>Token ID:</label>
        <input
          type="number"
          value={tokenId}
          onChange={(e) => setTokenId(Number(e.target.value))}
        />
      </div>
      <button onClick={claimNFT} disabled={loading}>
        Claim NFT
      </button>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {transactionHash && (
        <div>
          <p>Transaction Hash: {transactionHash}</p>
        </div>
      )}
    </div>
  );
};

export default NFTGallery;