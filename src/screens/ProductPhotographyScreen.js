// screens/ProductPhotographyScreen.js
import React, { useState } from "react";
import {
    View,
    Text,
    Button,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    TextInput,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import { Buffer } from "buffer";
import clipdrop from "../utils/clipdrop";

export default function ProductPhotographyScreen() {
    const [srcImage, setSrcImage] = useState(null);
    const [outImage, setOutImage] = useState(null);
    const [loading, setLoading] = useState(false);



    const pickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: "photo" }, (res) => {
            if (res.didCancel || res.errorCode) return;
            setSrcImage(res.assets[0].uri);
        });
    };

    const generateStudioPhoto = async () => {
        if (!srcImage) return Alert.alert("Select Image", "Please choose an image first.");

        try {
            setLoading(true);
            setOutImage(null);

            const formData = new FormData();
            formData.append("image_file", {
                uri: srcImage,
                type: "image/jpeg", // ✅ force jpeg for consistency
                name: "product.jpg",
            });



            const response = await clipdrop.post(
                "/product-photography/v1",
                formData,
                {
                    responseType: "arraybuffer",
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            const b64 = Buffer.from(response.data, "binary").toString("base64");
            setOutImage(`data:image/jpeg;base64,${b64}`);
        } catch (err) {
            console.error(
                "Product Photo API Error:",
                err?.response?.data
                    ? Buffer.from(err.response.data, "binary").toString()
                    : err.message
            );
            Alert.alert("Error", "Failed to create product photo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
                Product Photography
            </Text>

            <Button title="Pick Product Image" onPress={pickImage} />

            {srcImage && (
                <>
                    <Image
                        source={{ uri: srcImage }}
                        style={{ width: "100%", height: 200, marginVertical: 10 }}
                        resizeMode="contain"
                    />


                    <Button title="Generate Studio Photo" onPress={generateStudioPhoto} />
                </>
            )}



            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

            {outImage && (
                <Image
                    source={{ uri: outImage }}
                    style={{ width: "100%", height: 300, marginTop: 10 }}
                    resizeMode="contain"
                />
            )}
        </ScrollView>
    );
}
