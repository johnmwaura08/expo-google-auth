import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View, Button } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const [userInfo, setUserInfo] = React.useState(null);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "",
    iosClientId:
      "",
    webClientId:
      "",
  });

  async function signInWithGoogleAsync() {
    const user = await AsyncStorage.getItem("@user");
    if (!user) {
      if (response?.type === "success") {
        await getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(JSON.parse(user));
    }
  }

  React.useEffect(() => {
    signInWithGoogleAsync();
  }, [response]);

  const getUserInfo = async (token) => {
    try {
      //  hit our own api to verify the token and return jwt
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userInfoResponse = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(userInfoResponse));
      setUserInfo(userInfoResponse);
    } catch (error) {
      console.error("Err:", error);
    }
  };

  const text = JSON.stringify(userInfo, null, 2);

  return (
    <SafeAreaView style={styles.container}>
      <Text>{text}</Text>
      <Button
        onPress={() =>  promptAsync()}
        title="Sign in with Google"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
      <Button onPress={() => AsyncStorage.removeItem("@user")} title="Logout" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
