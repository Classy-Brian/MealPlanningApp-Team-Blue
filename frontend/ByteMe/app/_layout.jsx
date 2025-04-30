import { Image, View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import getUserIdFromToken from '@/components/getUserIdFromToken';
import { colors } from "../components/Colors";

function HeaderLogo() {
  return (
    <View style={styles.container}>
      <Image
        style={styles.stretch}
        source={require('../assets/images/logo.png')}
      />
    </View>
  );
}

function ProfileIcon() {
  const router = useRouter();
  const [avatar, setAvatar] = useState(null);

  const fetchUserAvatar = async () => {
    try {
      const userId = await getUserIdFromToken();
      if (!userId) return;

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/users/${userId}`);
      if (!response.ok) {
        console.warn('Failed to fetch avatar:', await response.text());
        return;
      }

      const data = await response.json();
      setAvatar(data.avatar || null);
    } catch (err) {
      console.error('Failed to fetch user avatar:', err.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserAvatar();
    }, [])
  );

  return (
    <TouchableOpacity onPress={() => router.push('/(profile)/profile')}>
      <Image
        source={avatar ? { uri: avatar } : require('../assets/images/profile.png')}
        style={styles.profileImage}
      />
    </TouchableOpacity>
  );
}

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)"
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen name="(start)" options={{ headerShown: false }} />
      <Stack.Screen name="(survey)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(profile)" options={{ headerShown: false }} />
      <Stack.Screen name="(settings)" options={{ headerShown: false }} />
      <Stack.Screen name="(calendar)" options={{ headerShown: false }} />
      <Stack.Screen name="(pantry)"
        options={{
          headerShown: true,
          headerLeft: () => null,
          headerBackVisible: false,
          headerTitle: () => <HeaderLogo />,
          headerRight: () => <ProfileIcon />,
          headerStyle: {
            backgroundColor: colors.header,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  stretch: {
    width: 120,
    height: 50,
    resizeMode: 'stretch',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.white,
  },
});

export default _layout;
