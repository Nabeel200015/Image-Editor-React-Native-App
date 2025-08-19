import {
    View,
    Text,
    Button,
    Image,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
    TextInput
} from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'react-native-image-picker';
import clipdrop from '../utils/clipdrop';

/**
 * This screen allows the user to:
 * - Pick a main image
 * - Pick a background image
 * - Replace the background using Clipdrop API
 */
const ReplaceBackgroundScreen = () => {
    const [mainImage, setMainImage] = useState(null);
    const [backgroundPrompt, setBackgroundPrompt] = useState('');
    const [processedImage, setProcessedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickMainImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel || response.errorCode) return;

            if (response.assets?.[0].uri) {
                setMainImage(response.assets?.[0].uri)
                setProcessedImage(null);
            }
        });
    };

    const replaceBackground = async () => {
        if (!mainImage) return Alert.alert('Missing image', 'Please choose an image to replace background');

        try {
            setLoading(true);
            setProcessedImage(null);

            const mainBlob = await (await fetch(mainImage)).blob();
            const formData = new FormData();
            formData.append('image_file', {
                uri: mainImage,
                type: mainBlob.type || 'image/jpeg',
                name: 'photo.jpg',
            });
            formData.append('prompt', backgroundPrompt || ''); //Include Background Prompt

            const result = await clipdrop.post('/replace-background/v1', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob',
            });

            //Convert Blob to Base URI
            const reader = new FileReader();
            reader.onloadend = () => {
                setProcessedImage(reader.result);
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
    }


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Replace Background</Text>
            <Button title="Pick Main Image" onPress={pickMainImage} />
            {mainImage && <Image source={{ uri: mainImage }} style={styles.image} />}

            {mainImage && !loading && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe new background (can leave empty)"
                        placeholderTextColor={'#000'}
                        value={backgroundPrompt}
                        onChangeText={setBackgroundPrompt}
                    />
                    <Button title="Replace Background" onPress={replaceBackground} />
                </>
            )}

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
    container: {
        padding: 16,
        gap: 16,
        flexGrow: 1,
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
        marginTop: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        alignSelf: 'center'
    },
    input: {
        borderWidth: 2,
        borderRadius: 16,
        fontSize: 14,
        padding: 8,
        color: '#000'
    }

});

export default ReplaceBackgroundScreen;