import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { styles } from '../styles/screens/LoginScreen.styles';

export default function LoginScreen({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (isLogin) {
      if (!username || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      onLogin({ username, password });
    } else {
      if (!username || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      if (onRegister) {
        onRegister({ username, email, password });
      } else {
        Alert.alert('Error', 'Registration is not available.');
      }
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.inner}>
          <Text style={styles.logo}>Plantae.</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to your sanctuary' : 'Create your sanctuary account'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>{isLogin ? 'Enter Garden' : 'Register'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={switchMode} style={styles.toggleLink}>
            <Text style={styles.toggleText}>
              {isLogin ? (
                <><Text style={styles.dimText}>Don't have an account? </Text><Text style={styles.highlightText}>Sign Up</Text></>
              ) : (
                <><Text style={styles.dimText}>Already have an account? </Text><Text style={styles.highlightText}>Login</Text></>
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
