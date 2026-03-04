import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export const uploadJSONToIPFS = async (metadata: any) => {
  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
      },
      body: JSON.stringify(metadata)
    });
    
    if (!res.ok) {
        throw new Error(`Pinata JSON upload failed: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw error;
  }
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadFileToIPFS = async (file: File) => {
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const metadata = JSON.stringify({ name: file.name });
            formData.append('pinataMetadata', metadata);

            const options = JSON.stringify({ cidVersion: 1 });
            formData.append('pinataOptions', options);

            const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
                },
                body: formData
            });

            if (!res.ok) {
                 const text = await res.text();
                 throw new Error(`Pinata File upload failed: ${res.status} ${res.statusText} - ${text}`);
            }

            const data = await res.json();
            return data.IpfsHash;
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            attempt++;
            if (attempt === MAX_RETRIES) throw error;
            await wait(1000 * attempt); 
        }
    }
};

export const fetchJSONFromIPFS = async (ipfsUri: string) => {
    try {
        const hash = ipfsUri.replace("ipfs://", "");
        const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway.pinata.cloud";
        const res = await fetch(`${gateway}/ipfs/${hash}`);
        if (!res.ok) throw new Error("Failed to fetch IPFS data");
        return await res.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const unpinJSONFromIPFS = async (ipfsUri: string) => {
    try {
        const hash = ipfsUri.replace("ipfs://", "");
        const res = await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
            }
        });
        if (!res.ok) throw new Error("Failed to unpin from Pinata");
        return true;
    } catch (error) {
        console.error("Error unpinning from IPFS:", error);
        return false;
    }
};
