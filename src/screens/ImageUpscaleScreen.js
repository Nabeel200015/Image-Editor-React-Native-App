// screens/ImageUpscaleScreen.js

import React, { useState } from "react";
import {
    View,
    Text,
    Button,
    Image,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import clipdrop from "../utils/clipdrop"; // our axios instance

const ImageUpscaleScreen = () => {
    const [mainImage, setMainImage] = useState(null);
    const [upscaledImage, setUpscaledImage] = useState(null);
    const [loading, setLoading] = useState(false);

    // target dimensions (defaults: 2x typical 512px preview → 1024px)
    const [targetWidth, setTargetWidth] = useState("1024");
    const [targetHeight, setTargetHeight] = useState("1024");

    // 📌 Pick image from gallery
    const handlePickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
            if (response.didCancel || response.errorCode) return;
            if (response.assets?.[0].uri) {
                setMainImage(response.assets[0].uri);
                setUpscaledImage(null);
            }
        });
    };

    // 📌 Process Upscaling
    const handleUpscale = async () => {
        if (!mainImage) return Alert.alert("No image", "Please select an image first.");
        if (!targetWidth || !targetHeight)
            return Alert.alert("Invalid size", "Please enter width & height.");

        try {
            setLoading(true);
            setUpscaledImage(null);

            // Convert image to blob
            const imgBlob = await (await fetch(mainImage)).blob();

            // Prepare form data
            const formData = new FormData();
            formData.append("image_file", {
                uri: mainImage,
                type: imgBlob.type,
                name: "photo.jpg",
            });
            formData.append("target_width", targetWidth);
            formData.append("target_height", targetHeight);

            // Call Clipdrop API
            const result = await clipdrop.post("/image-upscaling/v1/upscale", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            // Convert response blob → base64 for <Image />
            const reader = new FileReader();
            reader.onloadend = () => {
                setUpscaledImage(reader.result);
                setLoading(false);
            };
            reader.readAsDataURL(result.data);
        } catch (err) {
            console.error("Upscale API Error:", err.message);
            Alert.alert("Error", "Image Upscaling failed.");
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Image Upscaling</Text>
            <Button title="Pick Image" onPress={handlePickImage} />

            {mainImage && (
                <>
                    <Text style={styles.label}>Original</Text>
                    <Image source={{ uri: mainImage }} style={styles.image} />
                </>
            )}

            {/* Inputs for target size */}
            {mainImage && (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Target Width:</Text>
                    <TextInput
                        value={targetWidth}
                        onChangeText={setTargetWidth}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    <Text style={styles.label}>Target Height:</Text>
                    <TextInput
                        value={targetHeight}
                        onChangeText={setTargetHeight}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                </View>
            )}

            {mainImage && <Button title="Upscale" onPress={handleUpscale} />}

            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

            {upscaledImage && (
                <>
                    <Text style={styles.label}>Upscaled Result</Text>
                    <Image source={{ uri: upscaledImage }} style={styles.image} />
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
    inputContainer: { marginVertical: 12 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        fontSize: 16,
    },
});

export default ImageUpscaleScreen;
