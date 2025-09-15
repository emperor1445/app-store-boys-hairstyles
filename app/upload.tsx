import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Modal, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Toast from "react-native-root-toast";
import { Ionicons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { Video, ResizeMode } from "expo-av";

export default function UploadScreen() {
  // media items: { uri, isVideo: boolean, fileName?: string, mime?: string, duration?, size? }
  const [media, setMedia] = useState([] as Array<any>);
  const [tag, setTag] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [showTagOptions, setShowTagOptions] = useState(false);

  // helper to extract extension & mime
  const extFromUri = (uri: string) => {
    const m = uri.split("?")[0].split(".").pop();
    return (m || "").toLowerCase();
  };
  const mimeFromExt = (ext: string) => {
    if (!ext) return "application/octet-stream";
    if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
    if (ext === "png") return "image/png";
    if (ext === "gif") return "image/gif";
    if (["mp4", "mov", "m4v"].includes(ext)) return "video/mp4";
    if (ext === "webm") return "video/webm";
    return ext.startsWith("heic") ? "image/heic" : `application/octet-stream`;
  };

  // constants
  const MAX_VIDEO_DURATION = 60; // seconds
  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  // helper to get blob size fallback
  async function getUriFileSize(uri: string): Promise<number | null> {
    try {
      const resp = await fetch(uri);
      const blob = await resp.blob();
      return blob.size ?? null;
    } catch (err) {
      console.warn('Could not determine file size for', uri, err);
      return null;
    }
  }

  // PICKER (unchanged behavior except duration ms->s normalization)
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show("Permission to access gallery is required.", { duration: Toast.durations.SHORT });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: 5,
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
      });

      if (result.canceled) return;

      const assets = result.assets || [];
      const validItems: any[] = [];
      const rejected: string[] = [];

      for (const asset of assets) {
        const uri = asset.uri;
        const ext = asset.fileName ? asset.fileName.split('.').pop()?.toLowerCase() : (uri.split('.').pop() || '').toLowerCase();
        const extStr = ext || '';
        const isVideo = (asset.type === "video") || ['mp4','mov','m4v','webm'].includes(extStr);

        // duration check (normalize ms->s)
        if (isVideo) {
          let duration = typeof asset.duration === 'number' ? asset.duration : null;
          if (duration !== null) {
            if (duration > 1000) duration = duration / 1000; // convert ms -> s
            if (duration > MAX_VIDEO_DURATION) {
              rejected.push(`${asset.fileName || 'Video'} — too long (${Math.round(duration)}s)`);
              continue;
            }
          }
        }

        // size check
        let fileSize = (asset as any).fileSize ?? null;
        if (!fileSize) {
          const sz = await getUriFileSize(uri);
          fileSize = sz;
        }
        if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
          const mb = (fileSize / (1024 * 1024)).toFixed(1);
          rejected.push(`${asset.fileName || 'File'} — too big (${mb} MB)`);
          continue;
        }

        const fileName = asset.fileName || `upload_${Date.now()}.${ext || (isVideo ? 'mp4' : 'jpg')}`;
        const mime = isVideo ? 'video/mp4' : `image/${ext === 'jpg' ? 'jpeg' : (ext || 'jpeg')}`;
        validItems.push({ uri, isVideo, fileName, mime, duration: asset.duration ?? null, size: fileSize });
      }

      if (rejected.length > 0) {
        Alert.alert(
          'Upload blocked',
          `Some items were not added:\n\n${rejected.join('\n')}\n\nVideos must be ≤ ${MAX_VIDEO_DURATION}s and ≤ ${Math.round(MAX_FILE_SIZE_BYTES / (1024*1024))} MB.`,
          [{ text: 'OK' }]
        );
      }

      const merged = [...media, ...validItems].slice(0, 5);
      setMedia(merged);
    } catch (err) {
      console.error('Picker error', err);
      Toast.show('Could not open gallery.', { duration: Toast.durations.SHORT });
    }
  };

  // REMOVE single item (with confirmation)
  const removeItem = (index: number) => {
    Alert.alert(
      'Remove item',
      'Are you sure you want to remove this selected item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: () => {
            setMedia(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleUpload = async () => {
    if (media.length === 0 || !tag.trim()) {
      Toast.show("Please select media and pick a tag.", { duration: Toast.durations.SHORT });
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      media.forEach((m: any, idx: number) => {
        let uri = m.uri;
        if (!uri.startsWith("file://") && uri.startsWith("/")) uri = "file://" + uri;

        formData.append("media", {
          uri,
          name: m.fileName,
          type: m.mime || mimeFromExt(extFromUri(uri)),
        } as any);
      });

      const response = await fetch(`https://ankara.prospercode.xyz/upload/${tag}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        Toast.show("Media sent for review successfully.", { duration: Toast.durations.SHORT });
        setMedia([]);
        setTag("");
        setShowDialog(true);
      } else {
        console.log("Upload failed response:", result);
        Toast.show(result?.message || "Upload failed.", { duration: Toast.durations.SHORT });
      }
    } catch (error) {
      console.error("Upload error:", error);
      Toast.show("An error occurred while uploading.", { duration: Toast.durations.SHORT });
    } finally {
      setLoading(false);
    }
  };

  // render preview with remove icon
  const renderPreview = (item: any, index: number) => {
    // container styles same for image/video but allow larger video preview
    const containerStyle = { marginRight: 12, position: "relative" as "relative", width: item.isVideo ? 120 : 80, height: item.isVideo ? 90 : 80 };

    return (
      <View key={item.uri + index} style={containerStyle}>
        {/* remove button - top right */}
        <TouchableOpacity
          accessibilityLabel={`Remove selected item ${index + 1}`}
          onPress={() => removeItem(index)}
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 14,
            width: 28,
            height: 28,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}
        >
          <Ionicons name="close" size={18} color="#fff" />
        </TouchableOpacity>

        {item.isVideo ? (
          <Video
            source={{ uri: item.uri }}
            style={{ width: item.isVideo ? 120 : 80, height: item.isVideo ? 80 : 80, borderRadius: 8, overflow: 'hidden' }}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={false}
          />
        ) : (
          <Image
            source={{ uri: item.uri }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
          />
        )}

        <Text style={{ color: "#aaa", fontSize: 11, marginTop: 6, textAlign: 'center' }}>
          {item.isVideo ? 'Video' : 'Image'}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 30, backgroundColor: "#121212" }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, paddingTop: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: "center", fontSize: 20, fontWeight: "bold", color: "#fff" }}>
          Upload Your Styles
        </Text>
      </View>

      <TouchableOpacity
        onPress={pickMedia}
        style={{
          borderWidth: 2,
          borderColor: "#00c6ff",
          borderRadius: 12,
          padding: 30,
          alignItems: "center",
          marginBottom: 40,
          marginTop: 50,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, marginBottom: 10 }}>Choose or Pick Your Styles</Text>
        <Text style={{ color: "#aaa", fontSize: 12 }}>Max 5 items (images or videos)</Text>
      </TouchableOpacity>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {media.map((m, i) => renderPreview(m, i))}
      </ScrollView>

      {/* Tag Picker */}
      <View style={{ marginBottom: 30 }}>
        <TouchableOpacity
          onPress={() => setShowTagOptions(true)}
          style={{
            borderWidth: 1,
            borderColor: "#333",
            borderRadius: 10,
            padding: 14,
            backgroundColor: "#1e1e1e",
          }}
        >
          <Text style={{ color: tag ? "#fff" : "#777" }}>{tag || "Pick Tag"}</Text>
        </TouchableOpacity>

        <Modal visible={showTagOptions} transparent animationType="fade" onRequestClose={() => setShowTagOptions(false)}>
          <TouchableOpacity activeOpacity={1} onPressOut={() => setShowTagOptions(false)} style={{
            flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center'
          }}>
            <View style={{ backgroundColor: "#1e1e1e", borderRadius: 12, width: 250, paddingVertical: 10 }}>
              {Array.from({ length: 12 }, (_, i) => {
                const value = `category${i + 1}`;
                return (
                  <TouchableOpacity key={value} onPress={() => { setTag(value); setShowTagOptions(false); }}
                    style={{ paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: i !== 11 ? 1 : 0, borderBottomColor: "#333" }}>
                    <Text style={{ color: "#fff", fontSize: 16 }}>{value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      <TouchableOpacity onPress={handleUpload} activeOpacity={0.8} disabled={loading || media.length === 0 || media.length > 5}>
        <LinearGradient colors={["#00c6ff", "#ff7300"]} style={{
          padding: 15, borderRadius: 10, alignItems: "center",
          opacity: loading || media.length === 0 || media.length > 5 ? 0.6 : 1, marginBottom: 150,
        }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Upload</Text>}
        </LinearGradient>
      </TouchableOpacity>

      {/* Success modal */}
      <Modal visible={showDialog} transparent animationType="fade" onRequestClose={() => setShowDialog(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: 300, backgroundColor: '#1e1e1e', borderRadius: 20, padding: 20, alignItems: 'center' }}>
            <LottieView source={require("../assets/json/upload.json")} autoPlay loop={false} style={{ width: 200, height: 200 }} onAnimationFinish={() => setShowDialog(false)} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 10 }}>Congratulations!</Text>
            <Text style={{ color: '#aaa', textAlign: 'center', marginVertical: 8 }}>Media sent for review successfully.</Text>
            <TouchableOpacity onPress={() => setShowDialog(false)} style={{ marginTop: 10, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 10, backgroundColor: '#00c6ff' }}>
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
