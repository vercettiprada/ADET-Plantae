import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, 
  KeyboardAvoidingView, Platform, Alert, TouchableWithoutFeedback, Keyboard 
} from 'react-native';

export default function LoginScreen({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    Keyboard.dismiss();

    if (isLogin) {
      if (!username || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      onLogin({ username, password });
    } else {
      if (!username || !email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      if (onRegister) {
        onRegister({ username, email, password });
      } else {
        Alert.alert("Error", "Registration is not available.");
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
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <View style={styles.inner}>
          <Text style={styles.logo}>Plantae.</Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Sign in to your sanctuary" : "Create your sanctuary account"}
          </Text>

          {/* Username — shown in both modes */}
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          {/* Email — only shown when registering */}
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
              : <Text style={styles.buttonText}>{isLogin ? "Enter Garden" : "Register"}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={switchMode} style={{ marginTop: 25 }}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1eeee' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 30, marginBottom: 50 },
  logo: { fontSize: 48, fontFamily: 'AstonScript', color: '#2d5a27', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: { 
    backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 16, 
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 
  },
  button: { backgroundColor: '#2d5a27', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleText: { textAlign: 'center', fontSize: 14 },
  dimText: { color: '#aaa', fontWeight: '400' },
  highlightText: { color: '#2d5a27bd', fontWeight: '700' },
});
