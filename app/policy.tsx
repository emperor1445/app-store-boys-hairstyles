import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Checkbox from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

interface PolicyScreenProps {
  /** optional callback if parent wants to control navigation */
  onContinue?: () => void;
  /** Show "Don't show again" checkbox. Default: true for production behaviour */
  allowDontShowAgain?: boolean;
  /** When true and a stored value exists, auto-navigate to /upload. Default: true so users won't see the policy again after accepting. */
  autoSkipOnSeen?: boolean;
  storageKey?: string;
  /** Route to go back to when the back arrow is tapped (defaults to home '/') */
  homeRoute?: string;
}

export default function PolicyScreen({
  onContinue,
  allowDontShowAgain = true,
  autoSkipOnSeen = true,
  storageKey = '@policy_seen',
  homeRoute = '/',
}: PolicyScreenProps) {
  const [agreed, setAgreed] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!allowDontShowAgain) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const val = await AsyncStorage.getItem(storageKey);
        if (val === 'true') {
          // mark UI as accepted so user sees consistent state if the view briefly appears
          if (mounted) {
            setAgreed(true);
            setDontShowAgain(true);
          }

          if (autoSkipOnSeen) {
            // If parent supplied an onContinue callback prefer it
            if (onContinue) {
              onContinue();
            } else {
              // route to upload — replace so policy isn't in history
              router.replace('/upload');
            }
            return;
          }
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = async (bypass = false) => {
    if (!bypass && !agreed) {
      Alert.alert('Agreement required', 'Please check "I agree to follow the upload rules" before continuing.');
      return;
    }

    if (allowDontShowAgain && dontShowAgain) {
      try {
        await AsyncStorage.setItem(storageKey, 'true');
      } catch (e) {
        // ignore
      }
    }

    if (onContinue) {
      onContinue();
      return;
    }

    // Use replace so the policy screen is not left in the navigation stack
    router.replace('/upload');
  };

  const handleBackToHome = () => {
    // navigate back to homeRoute
    router.push(homeRoute);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBackToHome} style={styles.backButton} accessibilityLabel="Back to home">
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Upload Privacy & Content Rules</Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={styles.subtitle}>Please read these rules before uploading. Violations can lead to removal or account action.</Text>

        <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 12 }}>
          <Item emoji="⚠️" title="No nudity or sexually explicit content." desc="Keep uploads appropriate for a wide audience." />
          <Item emoji="🚫" title="No hate speech, harassment, or threats." desc="Respect other people and communities." />
          <Item emoji="📛" title="Protect privacy — don’t upload others' personal info or photos without consent." desc="If someone can be identified, ensure you have their permission." />
          <Item emoji="©️" title="No copyrighted material unless you own the rights." desc="Only upload content you created or have permission to share." />
          <Item emoji="🔞" title="No illegal content or instructions for wrongdoing." desc="We remove content that promotes or facilitates illegal activity." />
          <Item emoji="👍" title="Be authentic and respectful." desc="No spams, scams, or misleading content." />
        </ScrollView>

        <View style={styles.agreeBox}>
          <Checkbox value={agreed} onValueChange={setAgreed} style={styles.checkbox} color={agreed ? '#4F46E5' : undefined} />
          <Text style={styles.agreeText}>I agree to follow the upload rules</Text>
        </View>

        {allowDontShowAgain && (
          <View style={styles.dontShowRow}>
            <Checkbox value={dontShowAgain} onValueChange={setDontShowAgain} style={styles.checkbox} />
            <Text style={styles.dontShowText}>Don't show this again</Text>
          </View>
        )}

        <TouchableOpacity onPress={() => handleContinue()} disabled={!agreed} style={[styles.button, !agreed && styles.buttonDisabled]} accessibilityState={{ disabled: !agreed }}>
          <Text style={[styles.buttonText, !agreed && styles.buttonTextDisabled]}>Continue to Upload</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity
            onPress={async () => {
              try {
                await AsyncStorage.removeItem(storageKey);
                setDontShowAgain(false);
                setAgreed(false);
                Alert.alert('Reset', 'Policy preference cleared.');
              } catch (e) {
                Alert.alert('Error', 'Could not clear stored preference.');
              }
            }}
            style={styles.resetButton}
          >
            <Text style={styles.resetText}>Reset policy preference (dev)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Item({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 18,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: '#fff', fontSize: 20 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  subtitle: { color: '#cbd5e1', marginTop: 6, fontSize: 13 },
  list: { marginTop: 12, marginBottom: 8, minHeight: 120, maxHeight: 320 },
  item: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' as const },
  itemEmoji: { fontSize: 20, marginRight: 8 },
  itemTitle: { color: '#fff', fontWeight: '600' },
  itemDesc: { color: '#cbd5e1', fontSize: 13, marginTop: 2 },
  agreeBox: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dontShowRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  checkbox: { width: 20, height: 20, marginRight: 8 },
  agreeText: { color: '#e2e8f0' },
  dontShowText: { color: '#94a3b8' },
  button: {
    marginTop: 14,
    backgroundColor: '#7c3aed',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: 'rgba(255,255,255,0.06)' },
  buttonText: { color: '#fff', fontWeight: '600' },
  buttonTextDisabled: { color: 'rgba(255,255,255,0.4)' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  resetButton: { marginTop: 10, alignItems: 'center' },
  resetText: { color: '#94a3b8', fontSize: 12 },
});
