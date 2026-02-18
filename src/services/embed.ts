import { pipeline } from "@xenova/transformers";
// singleton for embedder.
class Embedder{
    private static instance :any;
    private constructor(){}
   public static async getInstance(): Promise<any> {
        if (!Embedder.instance) {
            try {
            console.log("Loading GTE-base embedding model...");
            Embedder.instance = await pipeline("feature-extraction", "Xenova/gte-base");
            console.log("Embedding model loaded successfully");
            } catch (err) {
            // Log the error and rethrow a more specific or application‑level error
            console.error("Failed to load embedding model:", err);
            throw new Error("Embedding model could not be initialized. Please try again later.");
            }
        }
        return Embedder.instance;
    }
}

export async function createEmbeddings(input:string){
    const embedder =await Embedder.getInstance();
      // Generate the embedding
    const result = await embedder(input, { pooling: "mean", normalize: true });
    return result.data;
}


// export async function createImageDescriptionEmbeddings(img_desciption){
    
// }