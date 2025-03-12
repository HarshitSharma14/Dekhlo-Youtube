import fetch from "node-fetch";
import "dotenv/config";

const HF_API_KEY = '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'; // Store API key in .env file

async function getEmbedding(text) {
    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${HF_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: [text] }), // Ensure it's an array
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error("Error from Hugging Face:", error);
            return;
        }

        const data = await response.json();
        console.log("Embedding:", data);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

getEmbedding("Hello, world!");



