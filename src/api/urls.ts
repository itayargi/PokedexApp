import { IS_IOS } from "@/utils/functionUtils";

const android_url = "192.168.1.113";
const ios_url = "127.0.0.1";
const urlAccordingDevice = IS_IOS ? ios_url : android_url;
export const BASE_URL = `http://${urlAccordingDevice}:8080`;
export const POKEMON_URL = "/pokemon";
