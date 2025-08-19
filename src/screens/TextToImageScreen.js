import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
} from "react-native";
import clipdrop from "../utils/clipdrop";

const TextToImageScreen = () => {
    const [prompt, setPrompt] = useState("");
    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // 📌 Call Clipdrop API
    const generateImage = async () => {
        if (!prompt.trim()) {
            return Alert.alert("Missing Prompt", "Please enter a description.");
        }

        try {
            setLoading(true);
            setGeneratedImage(null);

            const formData = new FormData();
            formData.append("prompt", prompt);

            // Optional params → can be added if you want more control
            // formData.append("guidance_scale", 7.5);
            // formData.append("num_inference_steps", 50);
            // formData.append("seed", 123);

            const result = await clipdrop.post("/text-to-image/v1", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob", // API returns binary image
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setGeneratedImage(reader.result);
                setLoading(false);
            };
            reader.readAsDataURL(result.data);
        } catch (error) {
            console.error("Text-to-Image API Error:", error.message);
            Alert.alert("Error", "Failed to generate image. Try again.");
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Text to Image</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter a prompt (e.g., A cat wearing sunglasses)"
                value={prompt}
                onChangeText={setPrompt}
                multiline
            />

            <Button title="Generate Image" onPress={generateImage} />

            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

            {generatedImage && (
                <View style={{ marginTop: 20 }}>
                    <Text style={styles.label}>Generated Result</Text>
                    <Image source={{ uri: generatedImage }} style={styles.image} />
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, gap: 16, flexGrow: 1 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, alignSelf: "center" },
    label: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 8,
        minHeight: 60,
        textAlignVertical: "top",
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: 300,
        resizeMode: "contain",
        borderRadius: 8,
        marginTop: 10,
    },
});

export default TextToImageScreen;
