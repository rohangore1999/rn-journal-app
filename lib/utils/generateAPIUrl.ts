import Constants from "expo-constants";

/**
 * You call: generateAPIUrl("/api/journals")
 * 
 * It returns:
 * "http://192.168.1.5:8081/api/journals"
 */
export const generateAPIUrl = (relativePath: string) => {
  /**
   * 1. The Problem:
      When you run npm start and open your app on a phone/emulator, Expo doesn't know where your API server is running. The app needs to find it dynamically.

   * Constants.experienceUrl:
      This gives you the current URL where Expo is serving your app:
      exp://192.168.1.5:8081
      exp:// = Expo's custom protocol
      192.168.1.5 = Your computer's local IP address
      8081 = Port where Expo is running

   *  */ 
  const origin = Constants.experienceUrl.replace("exp://", "http://");
  return `${origin}${relativePath}`;
};
