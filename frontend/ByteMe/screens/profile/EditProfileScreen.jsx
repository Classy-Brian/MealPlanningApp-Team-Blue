import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { styles } from '@/components/Sheet';
import backarrow from "@/assets/images/back_arrow_navigate.png";
import { Ionicons } from '@expo/vector-icons';
import getUserIdFromToken from '@/components/getUserIdFromToken';

function BackButton() {
  const navigation = useNavigation();
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <View style={styles.greybutton}>
          <Image style={{ marginRight: 10 }} source={backarrow} />
          <Text style={styles.regularText}>Profile</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function EditProfile() {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [userId, setUserId] = useState('');

  const presetAvatars = Array.from({ length: 20 }, (_, i) => `https://i.pravatar.cc/150?img=${i + 1}`);

  useEffect(() => {
    async function fetchUser() {
      try {
        const id = await getUserIdFromToken(); // ✅ resolve userId
        setUserId(id); // ✅ save in state for use in PATCH later

        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${id}`);
        const data = await response.json();

        setUsername(data.name || '');
        setAvatar(data.avatar || '');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    fetchUser(); // ✅ run once on mount
  }, []);

  const handleRemoveAvatar = () => {
    setAvatar('');
  };

  const handleSaveChanges = async () => {
    try {
      if (!userId) {
        console.warn("User ID not loaded yet.");
        return;
      }

      await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username, avatar }),
      });

      navigation.navigate('profile');
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <View style={det.container}>
      <BackButton />
      <Text style={styles.title}>Edit Profile</Text>

      {avatar ? (
        <Image source={{ uri: avatar }} style={det.avatarImage} />
      ) : (
        <Image source={require('../../assets/images/profile.png')} style={det.avatarImage} />
      )}

      <Text style={det.label}>Avatar URL</Text>
      <TextInput
        style={det.input}
        value={avatar}
        onChangeText={setAvatar}
        placeholder="Enter image URL"
      />

      <TouchableOpacity onPress={() => setAvatarModalVisible(true)} style={det.chooseAvatarButton}>
        <Text style={det.chooseAvatarButtonText}>Choose from preset avatars</Text>
      </TouchableOpacity>

      <TouchableOpacity style={det.removeAvatarButton} onPress={handleRemoveAvatar}>
        <Text style={det.removeAvatarButtonText}>Remove Avatar</Text>
      </TouchableOpacity>

      <Text style={det.label}>Username</Text>
      <TextInput
        style={det.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
      />

      <View style={det.buttonRow}>
        <TouchableOpacity style={det.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={det.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[det.saveButton, !userId && { opacity: 0.5 }]}
          onPress={handleSaveChanges}
          disabled={!userId}
        >
          <Text style={det.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for avatar selection */}
      <Modal visible={avatarModalVisible} animationType="slide" transparent>
        <View style={det.modalBackground}>
          <View style={det.avatarModalContainer}>
            <TouchableOpacity onPress={() => setAvatarModalVisible(false)} style={det.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.title}>Select an Avatar</Text>
            <ScrollView contentContainerStyle={det.avatarGrid}>
              {presetAvatars.map((url, idx) => (
                <TouchableOpacity key={idx} onPress={() => {
                  setAvatar(url);
                  setAvatarModalVisible(false);
                }}>
                  <Image source={{ uri: url }} style={det.presetAvatar} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const det = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  chooseAvatarButton: {
    backgroundColor: '#133E7C',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  chooseAvatarButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarModalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 10,
  },
  presetAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 5,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
});
