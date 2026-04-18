import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  TouchableWithoutFeedback, // Add this
  Keyboard // Add this
} from 'react-native';

export default function LoginScreen({ onLogin, onRegister, loading }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = () => {
    Keyboard.dismiss(); // Closes keyboard when you hit the button
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (isLogin) {
      onLogin({ email, password });
    } else {
      onRegister({ username, email, password });
    }
  };

  return (
    // This allows tapping outside to close the keyboard
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
      >
        <View style={styles.inner}>
          <Text style={styles.logo}>Plantae.</Text>
          <Text style={styles.subtitle}>{isLogin ? "Sign in to your sanctuary" : "Create your sanctuary account"}</Text>

          {!isLogin && (
            <TextInput 
              style={styles.input} 
              placeholder="Username" 
              value={username} 
              onChangeText={setUsername} 
              placeholderTextColor="#999"
            />
          )}
          <TextInput 
            style={styles.input} 
            placeholder="Email Address" 
            value={email} 
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor="#999"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            placeholderTextColor="#999"
          />

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSubmit} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? "Enter Garden" : "Register"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 25 }}>
              <Text style={styles.toggleText}>
                {isLogin ? (
                  <>
                    <Text style={styles.dimText}>Don't have an account? </Text>
                    <Text style={styles.highlightText}>Sign Up</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.dimText}>Already have an account? </Text>
                    <Text style={styles.highlightText}>Login</Text>
                  </>
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
  inner: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 30,
    // Add a slight negative margin to push content up when keyboard is active
    marginBottom: 50 
  },
  logo: { fontSize: 48, fontFamily: 'AstonScript', color: '#2d5a27', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 15, 
    fontSize: 16, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2 
  },
  button: { backgroundColor: '#2d5a27', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleText: { color: '#2d5a27', textAlign: 'center', fontWeight: '600' },toggleText: { 
    textAlign: 'center', 
    fontSize: 14 
  },
  dimText: { 
    color: '#aaa', // This makes the rest "hidden" or pushed back
    fontWeight: '400' 
  },
  highlightText: { 
    color: '#2d5a27bd', // The brand green
    fontWeight: '700' // Bold to make it pop
  },
});