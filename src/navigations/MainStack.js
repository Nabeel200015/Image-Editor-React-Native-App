import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import HomeScreen from '../screens/HomeScreen';
import BackgroundRemovalScreen from '../screens/BackgroundRemovalScreen';
import RemoveTextScreen from '../screens/RemoveTextScreen';
import ReplaceBackgroundScreen from '../screens/ReplaceBackgroundScreen';
import CleanupScreen from '../screens/CleanupScreen';
import ImageUpscaleScreen from '../screens/ImageUpscaleScreen';
import ReimagineScreen from '../screens/ReimagineScreen';
import TextToImageScreen from '../screens/TextToImageScreen';
import UncropScreen from '../screens/UncropScreen';
import ProductPhotographyScreen from '../screens/ProductPhotographyScreen';


const Stack = createNativeStackNavigator();

const MainStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Home' component={HomeScreen} />
            <Stack.Screen name='RemoveBG' component={BackgroundRemovalScreen} />
            <Stack.Screen name='RemoveText' component={RemoveTextScreen} />
            <Stack.Screen name='ReplaceBG' component={ReplaceBackgroundScreen} />
            <Stack.Screen name='Cleanup' component={CleanupScreen} />
            <Stack.Screen name='Upscale' component={ImageUpscaleScreen} />
            <Stack.Screen name='Reimagine' component={ReimagineScreen} />
            <Stack.Screen name='TextToImage' component={TextToImageScreen} />
            <Stack.Screen name='Uncrop' component={UncropScreen} />
            <Stack.Screen name='Product' component={ProductPhotographyScreen} />
        </Stack.Navigator>
    );
};

export default MainStack;