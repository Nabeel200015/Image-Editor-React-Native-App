import { View, Text, Image, Button, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import clipdrop from '../utils/clipdrop';

const BackgroundRemovalScreen = () => {
    const [originalImage, setOriginalImage] = useState(null); //URI of picked Image
    const [processedImage, setProcessedImage] = useState(null); //URI from Clipdrop
    const [loading, setLoading] = useState(false);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) return console.log('Camera Action Canceled');
            if (response.errorCode) return console.log('Camera Action Error :', response.errorCode);

            const asset = response.assets?.[0];
            console.log('Camera Asset :', response.assets[0]);

            if (asset?.uri) {
                setOriginalImage(asset.uri);
                setProcessedImage(null); // Reset Processed Image
            }
        });
    };

    const removeBackground = async () => {
        if (!originalImage) {
            console.log('No Image Selected');
            return Alert.alert('No Image Selected');
        }

        try {
            setLoading(true);
            setProcessedImage(null);

            //convert Image URI to blob
            const response = await fetch(originalImage);
            const blob = await response.blob();
            console.log('Blob data of image :', blob);


            const formData = new FormData();
            formData.append('image_file', {
                uri: originalImage,
                type: blob.type || 'image/jpeg',
                name: 'photo.jpg',
            });

            const result = await clipdrop.post('/remove-background/v1', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // important to recieve image blob
            });

            //Convert Blob to Base URI
            const reader = new FileReader();
            reader.onloadend = () => {
                setProcessedImage(reader.result); //base64 image URI
                setLoading(false);
            };
            reader.readAsDataURL(result.data);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to process image');
            setLoading(false);
        }
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Remove Background</Text>

            <Button title="Pick an Image" onPress={pickImage} />

            {originalImage && (
                <View style={styles.imageContainer}>
                    <Text>Original Image:</Text>
                    <Image source={{ uri: originalImage }} style={styles.image} />
                </View>
            )}

            {originalImage && !loading && (
                <Button title="Remove Background" onPress={removeBackground} />
            )}

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {processedImage && (
                <View style={styles.imageContainer}>
                    <Text>Processed Image:</Text>
                    <Image source={{ uri: processedImage }} style={styles.image} />
                </View>
            )}
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    imageContainer: {
        marginVertical: 10,
        alignItems: 'center',
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginTop: 8,
    },
});

export default BackgroundRemovalScreen;