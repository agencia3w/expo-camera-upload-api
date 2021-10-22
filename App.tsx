import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';

export default function App() {
	const [loading, setLoading] = useState(false);

	// Modal
	const [visible, setVisible] = useState(false);

	// Camera
	const camRef = useRef(null);
	const [hasPermission, setHasPermission] = useState(null);
	const [photo, setPhoto] = useState();
	const [responseApi, setResponseApi] = useState('');

	useEffect(() => {
		(async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		})();
	}, []);

	if (hasPermission === null) {
		return <View />;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	async function takePicture() {
		if (camRef) {
			const options = { quality: 0.8, base64: true }
			const data = await camRef.current.takePictureAsync(options);
			setPhoto(data);
			setVisible(false);
		}
	}

	async function handleUpload() {
		try {
			setLoading(true);
			const formData = new FormData();
			formData.append('image', {
				uri: photo.uri,
				type: 'image/jpg',
				name: 'photo.jpg'
			})
			const response = await axios.post('https://api.imgur.com/3/upload', formData, {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'multipart/form-data',
				}
			})
			console.log(response.data.data.link);
			setLoading(false);
		} catch (error) {
			console.log(error.response.data);
		}
	}

	return (
		<View style={styles.container}>
			<TouchableOpacity onPress={() => setVisible(true)}>
				<Feather name="camera" size={32} color="#c00" />
			</TouchableOpacity>

			{photo &&
				<>
					<Image source={{ uri: photo.uri }} style={styles.foto} />
					{loading ?
						<ActivityIndicator size="large" />
						:
						<>
							<TouchableOpacity onPress={handleUpload}>
								<Feather name="upload" size={32} />
							</TouchableOpacity>
							<Text>Imagem publicada no link:</Text>
							<Text selectable>{responseApi}</Text>
						</>
					}

				</>
			}

			<Modal animationType="slide" transparent={true} visible={visible}>
				<View style={styles.modal}>
					<Camera ref={camRef} type="back" style={styles.camera}>
						<TouchableOpacity style={styles.botaoFechar} onPress={() => setVisible(false)}>
							<Text style={styles.x}>x</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.botaoCamera} onPress={takePicture}>
							<Feather name="camera" size={32} color="#fff" />
						</TouchableOpacity>
					</Camera>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
	modal: {
		flex: 1,
		marginTop: 50,
		backgroundColor: '#333',
	},
	camera: {
		flex: 1,
	},
	botaoFechar: {
		backgroundColor: '#c00',
		width: 30,
		height: 30,
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		right: 10,
		top: 10
	},
	x: {
		color: '#fff',
		fontSize: 16
	},
	botaoCamera: {
		backgroundColor: '#c00',
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		bottom: 10,
		alignSelf: 'center',
	},
	foto: {
		width: 400,
		height: 400
	}
});
