import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import backarrow from "@/assets/images/back_arrow_navigate.png"
import { useNavigation, useRoute } from "@react-navigation/native";
import { styles } from '@/components/Sheet';

function BackButton() {
    const navigation = useNavigation();
    return (
        <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={[styles.greybutton, ]}>
                    <Image style={{marginRight:10}} source={backarrow}/>
                    <Text style={styles.regularText}>Profile</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default function EditProfile() {
  // const router = useRouter();
  const route = useRoute();
  const { userId } = route.params; // Get userId 
  const navigation = useNavigation();

  // Local state for user's data
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + `/api/users/${userId}`);
        const data = await response.json();

        setUsername(data.name || '');
        setAvatar(data.avatar || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatar('');
  };

  // Save updated user data
  const handleSaveChanges = async () => {
    try {
      await fetch(process.env.EXPO_PUBLIC_BACKEND_URL + `/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, avatar: avatar }),
      });

      // Navigate back to profile after saving
      navigation.navigate('profile');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // const handleCancel = () => {
  //   router.back();
  // };

  return (
    <View style={det.container}>
    {/* A back arrow*/}
      <BackButton />

      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar Display */}
      {avatar ? (
        <Image source={{ uri: avatar }} style={det.avatarImage} />
      ) : (
        <Image source={require('../../assets/images/profile.png')} style={det.avatarImage} />
      )}

      {/* Change Avatar Input */}
      <Text style={det.label}>Avatar URL</Text>
      <TextInput
        style={det.input}
        value={avatar}
        onChangeText={setAvatar}
        placeholder="Enter image URL"
      />

      {/* Remove Avatar Button */}
      <TouchableOpacity style={det.removeAvatarButton} onPress={handleRemoveAvatar}>
        <Text style={det.removeAvatarButtonText}>Remove Avatar</Text>
      </TouchableOpacity>

      {/* Username Input */}
      <Text style={det.label}>Username</Text>
      <TextInput
        style={det.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />

      {/* Action Buttons */}
      <View style={det.buttonRow}>
        <TouchableOpacity style={det.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={det.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={det.saveButton} onPress={handleSaveChanges}>
          <Text style={det.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const det = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 10,
    },
    backButtonText: {
      fontSize: 16,
      color: '#133E7C',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      alignSelf: 'center',
    },
    avatarImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignSelf: 'center',
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      marginTop: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      borderRadius: 8,
    },
    removeAvatarButton: {
      backgroundColor: '#B93E3E',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginTop: 10,
      alignSelf: 'flex-start',
    },
    removeAvatarButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 30,
    },
    cancelButton: {
      backgroundColor: '#A9BCD0',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    cancelButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: '#133E7C',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    saveButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  });