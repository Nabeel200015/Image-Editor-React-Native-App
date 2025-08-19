import { View, Text, Button, Image, ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'react-native-image-picker';
import clipdrop from '../utils/clipdrop';


/**
 * This screen allows the user to pick an image,
 * sends it to Clipdrop's Remove Text API,
 * and displays the result.
 */
const RemoveTextScreen = () => {
    const [originalImage, setOriginalImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel || response.errorCode) return;

            if (response.assets[0].uri) {
                setOriginalImage(response.assets?.[0].uri);
                setProcessedImage(null);

                console.log('Image picker Response assets[0] :', response.assets?.[0]);
            }
        });
    };

    const removeTextFromImage = async () => {
        if (!originalImage) {
            console.log('No image Selected');
            return Alert.alert('No Image Selected', 'Please select an image from your gallery.');
        }

        try {
            setLoading(true);
            setProcessedImage(null);

            //Convert Image URI to blob
            const response = await fetch(originalImage);
            const blob = await response.blob();
            console.log('Blob data of image :', blob);

            const formData = new FormData();
            formData.append('image_file', {
                uri: originalImage,
                type: blob.type || 'image/jpeg',
                name: 'photo.jpg',
            });

            console.log('Form data :', formData);

            const result = await clipdrop.post('/remove-text/v1', formData, {
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
            console.error('Remove Text API Error :', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Remove Text From Image</Text>
            <Button title="Pick an Image" onPress={handlePickImage} />

            {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

            {originalImage && (
                <>
                    <Text style={styles.label}>Original Image</Text>
                    <Image source={{ uri: originalImage }} style={styles.image} resizeMode='contain' />
                </>
            )}

            {originalImage && !loading && (
                <Button title="Remove Background" onPress={removeTextFromImage} />
            )}

            {processedImage && (
                <>
                    <Text style={styles.label}>Text Removed</Text>
                    <Image source={{ uri: processedImage }} style={styles.image} />
                </>
            )}
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 16,
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'contain',
        borderRadius: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        alignSelf: 'center'
    },
});

export default RemoveTextScreen;