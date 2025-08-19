import React, { useState } from "react";
import {
    View,
    Text,
    Button,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import clipdrop from "../utils/clipdrop";
import { Buffer } from "buffer"; // RN polyfill for Buffer

const ReimagineScreen = () => {
    const [mainImage, setMainImage] = useState(null);
    const [variation, setVariation] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: "photo" }, resp => {
            if (resp.didCancel || resp.errorCode) return;
            if (resp.assets?.[0]?.uri) {
                setMainImage(resp.assets[0].uri);
                setVariation(null);
            }
        });
    };

    const handleReimagine = async () => {
        if (!mainImage) {
            Alert.alert("No image selected", "Please choose an image first");
            return;
        }

        try {
            setLoading(true);
            setVariation(null);

            const formData = new FormData();
            formData.append("image_file", {
                uri: mainImage,
                type: "image/jpeg",
                name: "photo.jpg",
            });

            // 👇 use arraybuffer instead of blob
            const response = await clipdrop.post("/reimagine/v1/reimagine", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "arraybuffer",
            });

            // convert arraybuffer → base64 → data URI
            const base64 = Buffer.from(response.data, "binary").toString("base64");
            const dataUri = `data:image/jpeg;base64,${base64}`;

            setVariation(dataUri);
            setLoading(false);
        } catch (err) {
            console.error("Reimagine API Error:", err.message);
            Alert.alert("Error", "Failed to reimagine image");
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Reimagine Tool</Text>
            <Button title="Pick Image" onPress={handlePickImage} />

            {mainImage && (
                <>
                    <Text style={styles.label}>Original</Text>
                    <Image source={{ uri: mainImage }} style={styles.image} />
                    <Button title="Get Variation" onPress={handleReimagine} />
                </>
            )}

            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

            {variation && (
                <>
                    <Text style={styles.label}>Variation</Text>
                    <Image source={{ uri: variation }} style={styles.image} />
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, flexGrow: 1 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, alignSelf: "center" },
    label: { fontWeight: "bold", fontSize: 16, marginTop: 16 },
    image: { width: "100%", height: 300, resizeMode: "contain", marginVertical: 8 },
});

export default ReimagineScreen;
