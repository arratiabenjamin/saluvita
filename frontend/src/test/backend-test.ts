import { api } from "@/lib/api";

export const testBackend = async () => {
  try {
    const res = await api.get("/healthz");
    console.log("BACKEND OK:", res.data);
  } catch (err) {
    console.error("ERROR BACKEND:", err);
  }
};