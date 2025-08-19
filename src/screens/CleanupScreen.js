import React, { useState, useRef } from "react";
import {
    View,
    Text,
    Button,
    Image,
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    PanResponder,
    Dimensions,
} from "react-native";
import * as ImagePicker from "react-native-image-picker";
import Svg, { Path, Rect } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";
import ImageResizer from "react-native-image-resizer";
import clipdrop from "../utils/clipdrop";

const CleanupScreen = () => {
    const [mainImage, setMainImage] = useState(null);
    const [originalSize, setOriginalSize] = useState({ width: 1, height: 1 });
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paths, setPaths] = useState([]);
    const currentPath = useRef("");
    const viewShotRef = useRef();
    const [maskCapture, setMaskCapture] = useState(false);

    const screenWidth = Dimensions.get("window").width;
    const previewHeight = 400; // fixed preview height

    // 📌 Pick image
    const handlePickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: "photo" }, (response) => {
            if (response.didCancel || response.errorCode) return;
            if (response.assets?.[0].uri) {
                const asset = response.assets?.[0];
                setMainImage(asset.uri);
                setOriginalSize({
                    width: asset.width,
                    height: asset.height,
                });
                setProcessedImage(null);
                setLoading(false);
                setPaths([]);
            }
        });
    };

    // 📌 Drawing
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                const { locationX, locationY } = e.nativeEvent;
                currentPath.current = `M${locationX},${locationY}`;
            },
            onPanResponderMove: (e) => {
                const { locationX, locationY } = e.nativeEvent;
                currentPath.current += ` L${locationX},${locationY}`;
                setPaths([...paths, currentPath.current]);
            },
            onPanResponderRelease: () => {
                if (currentPath.current) {
                    setPaths((prev) => [...prev, currentPath.current]);
                    currentPath.current = "";
                }
            },
        })
    ).current;

    // 📌 Capture and upscale mask
    const generateMaskFile = async () => {
        try {
            setMaskCapture(true);
            // Capture mask from preview
            const uri = await viewShotRef.current.capture();
            const filePath = `${RNFS.CachesDirectoryPath}/mask_preview.png`;
            await RNFS.copyFile(uri, filePath);

            // Upscale mask to original size
            const resizedMask = await ImageResizer.createResizedImage(
                filePath,
                originalSize.width,
                originalSize.height,
                "PNG",
                100 // quality
            );
            setMaskCapture(false);
            return resizedMask.uri;
        } catch (err) {
            console.error("Mask capture error:", err);
            throw err;
        }
    };

    // 📌 Process Cleanup
    const processCleanup = async () => {
        if (!mainImage || !paths.length)
            return Alert.alert("Missing Data", "Select an image and draw mask first.");

        try {
            setLoading(true);
            setProcessedImage(null);

            const maskUri = await generateMaskFile();

            const mainBlob = await (await fetch(mainImage)).blob();

            const formData = new FormData();
            formData.append("image_file", {
                uri: mainImage,
                type: mainBlob.type,
                name: "photo.jpg",
            });
            formData.append("mask_file", {
                uri: maskUri,
                type: "image/png",
                name: "mask.png",
            });

            const result = await clipdrop.post("/cleanup/v1", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setProcessedImage(reader.result);
                setLoading(false);
            };
            reader.readAsDataURL(result.data);
        } catch (error) {
            console.error("Cleanup API Error:", error.message);
            setLoading(false);
        }
    };

    // 📌 Scale preview size
    const aspectRatio = originalSize.width / originalSize.height;
    const previewWidth = screenWidth - 32; // margin safe
    const scaledHeight = previewWidth / aspectRatio;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Cleanup Image</Text>
            <Button title="Pick Image" onPress={handlePickImage} />

            {mainImage && (
                <View style={{
                    width: "100%",
                    minHeight: scaledHeight > previewHeight ? previewHeight : scaledHeight,
                    marginVertical: 16,
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {/* Scaled preview image */}
                    <Image
                        source={{ uri: mainImage }}
                        style={{
                            width: previewWidth,
                            height: scaledHeight > previewHeight ? previewHeight : scaledHeight,
                            resizeMode: 'stretch',
                            alignSelf: "center",
                        }}
                    />

                    {/* Mask Drawing Area */}
                    <ViewShot
                        ref={viewShotRef}
                        options={{ format: "png", quality: 1.0, result: "tmpfile" }}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: previewWidth,
                            height: scaledHeight > previewHeight ? previewHeight : scaledHeight,
                            alignSelf: "center",
                        }}
                    >
                        <Svg
                            style={StyleSheet.absoluteFill}
                            {...panResponder.panHandlers}
                        >
                            <Rect width={previewWidth} height={scaledHeight > previewHeight ? previewHeight : scaledHeight} fill={!maskCapture ? 'transparent' : 'black'} />
                            {paths.map((d, i) => (
                                <Path
                                    key={i}
                                    d={d}
                                    stroke="white"
                                    strokeWidth={30}
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ))}
                        </Svg>
                    </ViewShot>
                </View>
            )}

            {mainImage && <Button title="Cleanup" onPress={processCleanup} />}
            {mainImage && <Button title="Clear Mask" onPress={() => setPaths([])} />}

            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

            {processedImage && (
                <>
                    <Text style={styles.label}>Result</Text>
                    <Image source={{ uri: processedImage }} style={styles.image} />
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 16, gap: 16, flexGrow: 1 },
    title: { fontSize: 22, fontWeight: "bold", marginBottom: 12, alignSelf: "center" },
    label: { fontWeight: "bold", fontSize: 16, marginTop: 16 },
    drawContainer: {

    },
    image: { width: "100%", height: 400, resizeMode: "contain" },
});

export default CleanupScreen;
