import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I can help generate your personalized meal plan. Just say "Plan my meals".',
    },
  ]);
  const [input, setInput] = useState('');

  const getPreferences = (text) => {
    const prefs = [];
    const lowered = text.toLowerCase();
    if (lowered.includes('vegetarian')) prefs.push('vegetarian');
    if (lowered.includes('high protein')) prefs.push('high protein');
    if (lowered.includes('low carb')) prefs.push('low carb');
    if (lowered.includes('vegan')) prefs.push('vegan');
    return prefs;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('No token found. Please log in.');

      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/ai/generate-plan/`,
        { preferences: getPreferences(input) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiResponse = res.data.plan;
      setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      console.error('Chatbot error:', err.message);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I couldn’t process your request. Please try again.' },
      ]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.chatBox}>
        {messages.map((msg, index) => (
          <Text key={index} style={msg.role === 'user' ? styles.userMsg : styles.assistantMsg}>
            {msg.content}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type something..."
          style={styles.input}
          onSubmitEditing={handleSend}     // 🎯 Pressing Enter sends message
          blurOnSubmit={false}            // 👌 Keeps keyboard open
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  chatBox: { flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#133E7C',
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#D7E2F1',
    color: '#000',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  assistantMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    color: '#000',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
});
