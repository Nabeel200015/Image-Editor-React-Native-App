// screens/UncropScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator, Alert, TextInput, ScrollView } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import clipdrop from '../utils/clipdrop'; // axios instance
import { Buffer } from 'buffer';

const UncropScreen = () => {
    const [imageUri, setImageUri] = useState(null);
    const [resultUri, setResultUri] = useState(null);
    const [loading, setLoading] = useState(false);

    // Extension values
    const [extendLeft, setExtendLeft] = useState('');
    const [extendRight, setExtendRight] = useState('');
    const [extendUp, setExtendUp] = useState('');
    const [extendDown, setExtendDown] = useState('');
    const [seed, setSeed] = useState('');

    // Pick image
    const pickImage = async () => {
        setResultUri(null);
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (!result.didCancel && result.assets?.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    // Call Uncrop API
    const handleUncrop = async () => {
        if (!imageUri) {
            Alert.alert('Error', 'Please select an image first.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image_file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'image.jpg',
            });

            // Only append if user entered values
            if (extendLeft && extendLeft !== '0') formData.append('extend_left', extendLeft);
            if (extendRight && extendRight !== '0') formData.append('extend_right', extendRight);
            if (extendUp && extendUp !== '0') formData.append('extend_up', extendUp);
            if (extendDown && extendDown !== '0') formData.append('extend_down', extendDown);
            if (seed && seed.trim() !== '') formData.append('seed', seed);

            const response = await clipdrop.post('/uncrop/v1', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'arraybuffer',
            });

            // Convert buffer → base64 → URI
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            const uri = `data:image/jpeg;base64,${base64}`;
            setResultUri(uri);
        } catch (error) {
            console.error('Uncrop API Error:', error);
            Alert.alert('Error', 'Failed to uncrop image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Uncrop Image</Text>
            <Button title="Pick Image" onPress={pickImage} />

            {imageUri && (
                <Image source={{ uri: imageUri }} style={{ width: 250, height: 250, marginVertical: 10, resizeMode: 'contain' }} />
            )}

            {/* Input fields */}
            <TextInput
                placeholder="Extend Left (px)"
                placeholderTextColor={'#000'}
                value={extendLeft}
                onChangeText={setExtendLeft}
                keyboardType="numeric"
                style={{ borderWidth: 1, width: '100%', padding: 8, marginVertical: 5 }}
            />
            <TextInput
                placeholder="Extend Right (px)"
                placeholderTextColor={'#000'}
                value={extendRight}
                onChangeText={setExtendRight}
                keyboardType="numeric"
                style={{ borderWidth: 1, width: '100%', padding: 8, marginVertical: 5 }}
            />
            <TextInput
                placeholderTextColor={'#000'}
                placeholder="Extend Up (px)"
                value={extendUp}
                onChangeText={setExtendUp}
                keyboardType="numeric"
                style={{ borderWidth: 1, width: '100%', padding: 8, marginVertical: 5 }}
            />
            <TextInput
                placeholder="Extend Down (px)"
                placeholderTextColor={'#000'}
                value={extendDown}
                onChangeText={setExtendDown}
                keyboardType="numeric"
                style={{ borderWidth: 1, width: '100%', padding: 8, marginVertical: 5 }}
            />
            <TextInput
                placeholder="Seed (optional)"
                placeholderTextColor={'#000'}
                value={seed}
                onChangeText={setSeed}
                keyboardType="numeric"
                style={{ borderWidth: 1, width: '100%', padding: 8, marginVertical: 5 }}
            />

            <Button title="Uncrop Image" onPress={handleUncrop} />

            {loading && <ActivityIndicator size="large" color="blue" style={{ marginTop: 20 }} />}

            {resultUri && (
                <Image source={{ uri: resultUri }} style={{ width: 250, height: 250, marginVertical: 20, resizeMode: 'contain' }} />
            )}
        </ScrollView>
    );
};

export default UncropScreen;
