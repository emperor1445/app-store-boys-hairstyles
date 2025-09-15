import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Modal } from "react-native";
import LottieView from "lottie-react-native";

export default function DownloadPage() {
  const { index, title, imageUrl } = useLocalSearchParams<{
    index: string;
    title: string;
    imageUrl: string;
  }>();
  const imageSrc = imageUrl || "";
  const imageTitle = title || "Default Title";

  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigation = useNavigation();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Set up the navigation header with back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title || "Bookmarked Styles",
      headerTitleAlign: "center",
      headerTitleStyle: { fontWeight: "bold" },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{ paddingHorizontal: 10 }}
        >
          <FontAwesome name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title]);

  useEffect(() => {
    checkIfBookmarked();
  }, []);

  const checkIfBookmarked = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarks");
      const parsedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
      const isBookmarked = parsedBookmarks.some(
        (item: { imageUrl: string }) => item.imageUrl === imageSrc
      );
      setIsBookmarked(isBookmarked);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  };

  const toggleBookmark = async () => {
    try {
      const bookmarks = await AsyncStorage.getItem("bookmarks");
      const parsedBookmarks = bookmarks ? JSON.parse(bookmarks) : [];
      let updatedBookmarks;

      if (isBookmarked) {
        updatedBookmarks = parsedBookmarks.filter(
          (item: { imageUrl: string }) => item.imageUrl !== imageSrc
        );
        setIsBookmarked(false);
        Toast.show({
          type: "info",
          position: "bottom",
          text1: "Bookmark removed.",
          visibilityTime: 2000,
        });
      } else {
        updatedBookmarks = [
          ...parsedBookmarks,
          { title: imageTitle, imageUrl: imageSrc },
        ];
        setIsBookmarked(true);
        Toast.show({
          type: "success",
          position: "bottom",
          text1: "Image bookmarked!",
          visibilityTime: 2000,
        });
      }

      await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error("Failed to update bookmarks:", error);
    }
  };

  useEffect(() => {
    const backAction = () => {
      // Show the interstitial ad when back button is pressed

      navigation.goBack(); // Navigate back if ad is not loaded

      return true; // Prevent default back action
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === "android") {
      try {
        // Request WRITE_EXTERNAL_STORAGE permission for Android
        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs access to your storage to download images.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (storagePermission !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }

    // Request Media Library permission for all platforms
    const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
    if (!mediaLibraryPermission.granted) {
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "Media Library permission is required to download images.",
        visibilityTime: 2000,
      });
      return false;
    }

    return true;
  };

  const downloadImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      return;
    }

    try {
      const uri = imageSrc;
      const downloadDir = FileSystem.cacheDirectory + `${title || "image"}.jpg`;

      const downloadResult = await FileSystem.downloadAsync(uri, downloadDir);

      if (downloadResult.status === 200) {
        const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
        await MediaLibrary.createAlbumAsync("Download", asset, false);

        // Show congratulatory dialog
        setShowSuccessDialog(true);
      } else {
        throw new Error("Download failed.");
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        position: "bottom",
        text1: "An error occurred during download.",
        visibilityTime: 2000,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={showSuccessDialog} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 15,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LottieView
              source={require("../assets/json/upload.json")}
              autoPlay
              loop={false}
              onAnimationFinish={() => setShowSuccessDialog(false)}
              style={{ width: 150, height: 150 }}
            />
            <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 10 }}>
              Image Downloaded!
            </Text>
            <TouchableOpacity
              onPress={() => setShowSuccessDialog(false)}
              style={{
                marginTop: 15,
                backgroundColor: "tomato",
                paddingVertical: 8,
                paddingHorizontal: 20,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast for download success */}

      {/* Header with Back Button */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 30, paddingTop: 40 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"#fff"} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {title}
        </Text>
      </View>

      <View style={styles.card}>
        <Image
          source={{ uri: imageSrc }}
          style={styles.image}
          resizeMode="stretch"
        />

        <View style={styles.iconContainerWrapper}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={downloadImage}
            accessible={true}
            accessibilityLabel="Download Image"
          >
            <FontAwesome name="download" size={24} color="tomato" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconContainer}
            onPress={toggleBookmark}
            accessible={true}
            accessibilityLabel="Bookmark Image"
          >
            <FontAwesome
              name="bookmark"
              size={24}
              color={isBookmarked ? "blue" : "gray"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          Click the download icon to save this image to your device.
        </Text>
        <Text style={styles.descriptionText}>
          You can also click the bookmark icon to save this image for future
          reference.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    padding: 10,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 5,
    elevation: 2,
    width: "95%",
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 250,
    marginBottom: 15,
  },
  iconContainerWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  iconContainer: {
    padding: 10,
    marginHorizontal: 15,
  },
  descriptionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
});
