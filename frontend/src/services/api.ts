import { axiosInstance } from "./axios";

export async function getDrawingsFrompost(prompt: string) {
    const res = await axiosInstance.post('api/drawing/generate', { Prompt: prompt });
    console.log('Response from server:', res.data);
    if (res.status !== 200) {
        throw new Error("Failed to generate drawing");
    }
    return res.data;
}
