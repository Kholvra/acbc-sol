import { SignJWT } from 'jose';

// VideoSDK Utilities
export const generateVideoSDKToken = async () => {
  const API_KEY = process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY;
  const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY; // Note: Use Server-side secret if called from Server Action

  if (!API_KEY) {
      console.error("VideoSDK API Key not found in env");
      return null;
  }

  // If this is client-side, we might need a server action later. 
  // For now, keeping the structure compatible.
  if (!SECRET_KEY) {
      console.error("VideoSDK Secret Key missing (required for signing)");
      return null;
  }

  const secret = new TextEncoder().encode(SECRET_KEY);

  const token = await new SignJWT({
      apikey: API_KEY,
      permissions: ['allow_join', 'allow_mod'], 
      version: 2,
  })
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setIssuedAt()
  .setExpirationTime('24h')
  .sign(secret);

  return token;
};

export const createMeeting = async (token: string) => {
  const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
    method: "POST",
    headers: {
      "authorization": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  
  if (!res.ok) {
    throw new Error("Failed to create meeting");
  }
  
  const { roomId } = await res.json();
  return roomId;
};

export const validateMeeting = async ({ roomId, token }: { roomId: string, token: string }) => {
    const url = `https://api.videosdk.live/v2/rooms/validate/${roomId}`;
    const options = {
      method: "GET",
      headers: { Authorization: token },
    };
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result ? result.roomId === roomId : false;
    } catch (error) {
        console.error("error", error);
        return false;
    }
};
