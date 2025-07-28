import { axiosInstance } from "./axios";

export async function getDrawingsFrompost(prompt: string) {
     
    const res=await axiosInstance.post('api/drawing/generate', { prompt });
    console.log('Response from server:', res.data);
    console.log('Response data:', res.data);
    if (res.status !== 200) {
        throw new Error("Failed to generate drawing");
    }
    return res.data;
}
