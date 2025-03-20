import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EditProfile() {
  const router = useRouter();
  const { userId } = useLocalSearchParams(); // Get userId from URL

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
      router.back();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
    {/* A back arrow*/}
      <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
        <Text style={styles.backButtonText}>{"< Profile"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Profile</Text>

      {/* Avatar Display */}
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatarImage} />
      ) : (
        <Image source={require('../../assets/images/profile.png')} style={styles.avatarImage} />
      )}

      {/* Change Avatar Input */}
      <Text style={styles.label}>Avatar URL</Text>
      <TextInput
        style={styles.input}
        value={avatar}
        onChangeText={setAvatar}
        placeholder="Enter image URL"
      />

      {/* Remove Avatar Button */}
      <TouchableOpacity style={styles.removeAvatarButton} onPress={handleRemoveAvatar}>
        <Text style={styles.removeAvatarButtonText}>Remove Avatar</Text>
      </TouchableOpacity>

      {/* Username Input */}
      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
