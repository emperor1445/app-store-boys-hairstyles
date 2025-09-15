import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
  Linking,
} from "react-native";
import { Link, router } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons";
import ReferralDialog from "../app/ReferralDialog"; // adjust path
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect, useState } from "react";

const App: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Toggle modal visibility
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

// Share app logic (App Store)
const handleShare = async () => {
  try {
    await Share.share({
      message:
        "Check out this amazing app: Latest Boys Fashion! Download it from the App Store here: https://apps.apple.com/app/idYOUR_APP_ID",
    });
  } catch (error) {
    Alert.alert("Error", "There was an issue sharing the app.");
  }
};

// Rate Us logic - Open app's App Store page
const handleRateUs = () => {
  Linking.openURL(
    "https://apps.apple.com/app/idYOUR_APP_ID"
  ).catch(() =>
    Alert.alert(
      "Error",
      "Could not open the App Store. Please check your internet connection."
    )
  );
};

  // Contact Us logic - Open email client
  const handleContactUs = () => {
    const email = "davidemperor1445@gmail.com";
    const subject = "Feedback for Boys hairstyles";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

    Linking.openURL(mailtoUrl).catch(() =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1.3, { duration: 800 }), -1, true);
  }, []);

  const animatedCrownStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: pulse.value > 1.2 ? 0.7 : 1,
    };
  });

  return (
    <View style={styles.container}>
      <ReferralDialog />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleModal}>
          <Icon name="menu" size={30} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerText}>Boys Hairstyles</Text>

        <View style={styles.headerIcons}>
          <Link href="./bookmark">
            <Icon name="bookmark" size={28} color="blue" />
          </Link>

          <TouchableOpacity onPress={() => router.push("/policy")}>
            <Animated.Image
              source={require("../assets/images/crown.png")}
              style={[styles.headerCrownIcon, animatedCrownStyle]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal for menu actions */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={toggleModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close button */}
            <TouchableOpacity style={styles.closeIcon} onPress={toggleModal}>
              <Icon name="clear" size={24} color="gray" />
            </TouchableOpacity>

            {/* Menu Options */}
            <TouchableOpacity style={styles.modalOption} onPress={handleShare}>
              <Text style={styles.modalOptionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleRateUs}>
              <Text style={styles.modalOptionText}>Rate Us</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleContactUs}
            >
              <Text style={styles.modalOptionText}>Contact Us/Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={toggleModal}>
              <Link href="/bookmark">
                <Text style={styles.modalOptionText}>Bookmark</Text>
              </Link>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* New Styles Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>New Styles</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Celebrity-inspired",
                  tag: "category1",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.largeCard}>
                <Image
                  source={require("../assets/images/a1.jpg")}
                  style={styles.image}
                />
                <TouchableOpacity style={styles.heartIcon}>
                  <Icon name="favorite" size={24} color="red" />
                </TouchableOpacity>
                <Text style={styles.cardText}>Celebrity-inspired</Text>
                <Text style={styles.cardSubText}>Explore styles</Text>
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Fades",
                  tag: "category2",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.largeCard}>
                <Image
                  source={require("../assets/images/a2.jpg")}
                  style={styles.image}
                />
                <TouchableOpacity style={styles.heartIcon}>
                  <Icon name="favorite" size={24} color="red" />
                </TouchableOpacity>
                <Text style={styles.cardText}>Fades</Text>
                <Text style={styles.cardSubText}>Explore styles</Text>
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Classis",
                  tag: "category3",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.largeCard}>
                <Image
                  source={require("../assets/images/a3.jpg")}
                  style={styles.image}
                />
                <TouchableOpacity style={styles.heartIcon}>
                  <Icon name="favorite" size={24} color="red" />
                </TouchableOpacity>
                <Text style={styles.cardText}>Classic</Text>
                <Text style={styles.cardSubText}>Explore styles</Text>
              </TouchableOpacity>
            </Link>
          </ScrollView>
        </View>

        {/* Promotional Card */}
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => router.push("/policy")}
        >
          <LinearGradient
            colors={["#00c6ff", "#ff7300"]}
            style={styles.promoGradient}
          >
            <Animated.Image
              source={require("../assets/images/crown.png")}
              style={[styles.crownIcon, animatedCrownStyle]}
            />

            <Text style={styles.promoTitle}>Promote Your Style</Text>
            <Text style={styles.promoSubtitle}>
              Upload your designs and get featured!
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Collection Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Collection</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Braids and Locks",
                  tag: "category4",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.smallCard}>
                <Image
                  source={require("../assets/images/a4.jpg")}
                  style={styles.image}
                />
                <Text style={styles.cardText}>Braids and Locks</Text>
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Trending Styles",
                  tag: "category5",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.smallCard}>
                <Image
                  source={require("../assets/images/a5.jpg")}
                  style={styles.image}
                />
                <Text style={styles.cardText}>Trending Styles</Text>
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Top Fashions",
                  tag: "category6",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.smallCard}>
                <Image
                  source={require("../assets/images/a6.jpg")}
                  style={styles.image}
                />
                <Text style={styles.cardText}>Top Fashions</Text>
              </TouchableOpacity>
            </Link>
          </ScrollView>
        </View>

        {/* More Styles Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>More Styles</Text>
          <View style={styles.gridContainer}>
            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Timeless",
                  tag: "category7",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={require("../assets/images/a7.jpg")}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Formal",
                  tag: "category8",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={require("../assets/images/a8.jpg")}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "casual",
                  tag: "category9",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={require("../assets/images/a9.jpg")}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "HairStyles",
                  tag: "category10",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={require("../assets/images/a10.jpg")}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Fashion",
                  tag: "category11",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={require("../assets/images/a11.jpg")}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            </Link>

            <Link
              href={{
                pathname: "/detail",
                params: {
                  title: "Sleek",
                  tag: "category12",
                },
              }}
              asChild
            >
              <TouchableOpacity style={styles.gridItem}>
                <Image
                  source={require("../assets/images/a12.jpg")}
                  style={styles.gridImage}
                />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/policy")}
      >
        <LinearGradient
          colors={["#00c6ff", "#ff7300"]}
          style={styles.fabGradient}
        >
          <Icon name="upload" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  sectionContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",

  },
  largeCard: {
    marginRight: 20,
    width: 160,
    height: 250,
    position: "relative",
  },


  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
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
    height: "85%",
    borderRadius: 10,
  },
  cardText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "600",
    color: "white",

  },
  cardSubText: {
    fontSize: 12,
    color: "gray",
  },
  heartIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  smallCard: {
    marginRight: 10,
    width: 120,
    height: 180,
  },
  /* New Styles for More Styles Section */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "30%",
    marginBottom: 15,
  },
  gridImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    zIndex: 100,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  promoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  promoGradient: {
    padding: 20,
    borderRadius: 15,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  promoSubtitle: {
    fontSize: 14,
    color: "#fff",
  },
  crownIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    top: 10,
    right: 10,
  },
  // header: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   justifyContent: "space-between",
  //   padding: 15,
  //   backgroundColor: "#fff",
  //   elevation: 4,
  // },

  // headerText: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   color: "#333",
  // },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCrownIcon: {
    width: 24,
    height: 24,
    marginLeft: 15,
  },
});


export default App;

