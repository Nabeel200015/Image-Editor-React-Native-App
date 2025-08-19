import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Image Editor</Text>
            </View>

            <View style={styles.body}>
                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('RemoveBG')}>
                    <Text style={styles.btnText}>Image Background Remove</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('RemoveText')}>
                    <Text style={styles.btnText}>Remove Image Text</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('ReplaceBG')}>
                    <Text style={styles.btnText}>Replace Image Background</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('Cleanup')}>
                    <Text style={styles.btnText}>Cleanup Object from Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('Upscale')}>
                    <Text style={styles.btnText}>Upscale Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('Reimagine')}>
                    <Text style={styles.btnText}>Reimagine Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('TextToImage')}>
                    <Text style={styles.btnText}>Text to Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('Uncrop')}>
                    <Text style={styles.btnText}>Uncrop the Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.selectBtn} onPress={() => navigation.navigate('Product')}>
                    <Text style={styles.btnText}>Product Photography</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    )
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        height: '10%',
        alignItems: 'center',
        justifyContent: "center"
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#000',
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10
    },
    selectBtn: {
        backgroundColor: 'lightgreen',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        borderRadius: 16,
    },
    btnText: {
        fontSize: 18,
        color: 'black',
        fontWeight: '500',
    }
});