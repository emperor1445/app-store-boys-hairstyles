import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Share,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import * as StoreReview from "expo-store-review";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Video, AVPlaybackStatus, AVPlayback, ResizeMode } from 'expo-av';
import { Video, ResizeMode } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import React, { useRef } from 'react';



interface ImageData {
  id: number;
  originalName: string;
  fileName: string;
  url: string;
  uploadTime: string;
}

export default function DetailPage() {
  const { title, tag } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});

  const [likeStates, setLikeStates] = useState<{ [key: number]: boolean }>({});
  const [likeScales, setLikeScales] = useState<{ [key: number]: Animated.Value }>({});

  // const handleReview = async () => {
  //   if (!hasReviewed && (await StoreReview.isAvailableAsync())) {
  //     await StoreReview.requestReview();
  //     setHasReviewed(true);
  //   }
  // };

  const [muteStates, setMuteStates] = useState<{ [key: number]: boolean }>({});
  const toggleMute = (id: number) => {
  setMuteStates((prevState) => ({
    ...prevState,
    [id]: !prevState[id],
  }));
};

  const handleShare = async (imageUrl: string, title: string | string[] | undefined) => {
    try {
      await Share.share({
        message: `Check out this style on the Fashion App! 🔥\n${imageUrl}`,
        title: `Fashion Style: ${title}`,
        url: imageUrl,
      });
    } catch (error) {
      console.error("Error sharing image:", error);
    }
  };

  function shuffleArray<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }


  
const [controlsVisible, setControlsVisible] = useState(true);
const fadeAnim = useRef(new Animated.Value(1)).current;
// const videoRefs = useRef({});

const showControls = () => {
  setControlsVisible(true);
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 200,
    useNativeDriver: true,
  }).start();

  // Hide after 3s
  setTimeout(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setControlsVisible(false);
    });
  }, 3000);
};

const togglePlayPause = (id: string) => {
  const videoRef = videoRefs.current[id];
  if (videoRef) {
    videoRef.getStatusAsync().then((status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        if (status.isPlaying) {
          videoRef.pauseAsync();
        } else {
          videoRef.playAsync();
        }
      }
    });
  }
  showControls(); // your function to show floating controls
};

 const handleLikePress = async (id: number) => {
  const scaleAnim = likeScales[id] || new Animated.Value(1);
  likeScales[id] = scaleAnim;
  Animated.sequence([
    Animated.timing(scaleAnim, {
      toValue: 1.4,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }),
  ]).start();
  const updatedLikes = { ...likeStates, [id]: !likeStates[id] };
  showControls();
  setLikeStates(updatedLikes);

  // save to AsyncStorage
  try {
    await AsyncStorage.setItem("likedImages", JSON.stringify(updatedLikes));
  } catch (error) {
    console.error("Failed to save like state", error);
  }
};


 useEffect(() => {
const fetchMedia = async () => {
  setLoading(true);
  try {
    const response = await fetch(`https://ankara.prospercode.xyz/media/${tag}`);
    const data: { media: ImageData[] } = await response.json();

    if (Array.isArray(data.media) && data.media.length > 0) {
      const shuffledImages: ImageData[] = shuffleArray(data.media);
      setImages(shuffledImages);
      setError(null);

      // init animations
      const initialScales: { [key: number]: Animated.Value } = {};
      shuffledImages.forEach((img) => {
        initialScales[img.id] = new Animated.Value(1);
      });
      setLikeScales(initialScales);

      // initialize mute states
      const initialMuteStates: { [key: number]: boolean } = {};
      shuffledImages.forEach((img) => {
      initialMuteStates[img.id] = true; 
      });
      setMuteStates(initialMuteStates);


      // load saved likes
      const savedLikesJSON = await AsyncStorage.getItem("likedImages");
      const savedLikes = savedLikesJSON ? JSON.parse(savedLikesJSON) : {};
      setLikeStates(savedLikes);
    } else {
      setImages([]);
      setError("No images found for this tag.");
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    setError("Failed to fetch images. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  fetchMedia();
}, [tag]);


  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => backHandler.remove();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }


return (
  <ScrollView style={styles.container}>
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 30, paddingTop: 40 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={"#fff"} />
      </TouchableOpacity>
      <Text style={styles.pageTitle}>{title}</Text>
    </View>


{images.length > 0 ? (
  images.map((item) => (
    <View key={item.id} style={styles.card}>
      {item.url.toLowerCase().endsWith(".mp4") ? (

        // Video component
       <View style={{ position: "relative" }}>
  <TouchableWithoutFeedback onPress={() => togglePlayPause(item.id.toString())}>
    <Video
      ref={(ref) => { videoRefs.current[item.id] = ref; }}
      source={{ uri: item.url }}
      rate={1.0}
      volume={1.0}
      isMuted={muteStates[item.id] ?? true}
      resizeMode={ResizeMode.COVER}
      shouldPlay
      isLooping
      style={styles.video}
      useNativeControls={false}
    />
  </TouchableWithoutFeedback>

  <Animated.View
    style={[
      styles.floatingControls,
      { opacity: fadeAnim },
    ]}
  >
    <TouchableOpacity onPress={() => handleLikePress(item.id)} style={styles.floatingButton}>
      <Animated.View style={{ transform: [{ scale: likeScales[item.id] || new Animated.Value(1) }] }}>
        <FontAwesome
          name={likeStates[item.id] ? "heart" : "heart-o"}
          size={32}
          color={likeStates[item.id] ? "tomato" : "#fff"}
        />
      </Animated.View>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => handleShare(item.url, title)} style={styles.floatingButton}>
      <Ionicons name="share-social" size={30} color="#fff" />
    </TouchableOpacity>

    <TouchableOpacity onPress={() => toggleMute(item.id)} style={styles.floatingButton}>
      <Ionicons
        name={muteStates[item.id] ? "volume-mute" : "volume-high"}
        size={30}
        color="#fff"
      />
    </TouchableOpacity>
  </Animated.View>
</View>

      ) : (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/download",
              params: {
                index: item.id.toString(),
                title: title || "Media",
                style: "Style description",
                imageUrl: item.url,
                originalName: item.originalName,
              },
            })
          }
        >
          <Image source={{ uri: item.url }} style={styles.image} resizeMode="stretch" />
          {/* Keep image text and like/share */}
          <View style={styles.textContainer}>
            <Text style={styles.imageTitle}>{title}</Text>
            <Text style={styles.imageStyle}>click style to enter download page</Text>
          </View>
          <View style={styles.likeContainer}>
            <TouchableOpacity onPress={() => handleLikePress(item.id)}>
              <Animated.View
                style={{ transform: [{ scale: likeScales[item.id] || new Animated.Value(1) }] }}
              >
                <FontAwesome
                  name={likeStates[item.id] ? "heart" : "heart-o"}
                  size={24}
                  color={likeStates[item.id] ? "tomato" : "#aaa"}
                />
              </Animated.View>
            </TouchableOpacity>
            <View style={{ width: 25 }} />
            <TouchableOpacity onPress={() => handleShare(item.url, title)}>
              <Ionicons name="share-social" size={24} color="#1e90ff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  ))
) : (
  <Text style={styles.noImagesText}>No Media available under this tag.</Text>
)}



  </ScrollView>
);


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 20,
  },
  soundIcon: {
  position: "absolute",
  bottom: 12,
  left: 12,
  backgroundColor: "rgba(0,0,0,0.5)",
  padding: 8,
  borderRadius: 20,
},
floatingControls: {
  position: "absolute",
  right: 15,
  bottom: 40,
  alignItems: "center",
  zIndex: 5,
},

floatingButton: {
  marginBottom: 30,
},

video: {
  width: "100%",
  height: 450,
  borderRadius: 12,
  overflow: "hidden",
},


  pageTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 25,
    overflow: "hidden",
    width: "100%",
    paddingBottom: 10,
  },
  image: {
    width: "100%",
    height: 380,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  textContainer: {
    padding: 15,
    backgroundColor: "#1e1e1e",
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  imageStyle: {
    fontSize: 14,
    color: "#cccccc",
    marginTop: 6,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  noImagesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#aaaaaa",
    marginTop: 20,
  },
  errorText: {
    textAlign: "center",
    fontSize: 16,
    color: "#ff4c4c",
    marginTop: 20,
  },
  likeContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#2a2a2a",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});

//   video: {
//   width: "100%",
//   height: 380,
//   borderTopLeftRadius: 16,
//   borderTopRightRadius: 16,
//   backgroundColor: "#000",
// },