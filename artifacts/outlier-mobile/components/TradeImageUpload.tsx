import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface TradeImageUploadProps {
  value: string[];
  onChange: (paths: string[]) => void;
  maxImages?: number;
}

const SID_KEY = "outlier_sid";

export default function TradeImageUpload({ value, onChange, maxImages = 8 }: TradeImageUploadProps) {
  const colors = useColors();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

  async function authHeaders(extra: Record<string, string> = {}) {
    const sid = await AsyncStorage.getItem(SID_KEY);
    return { ...extra, ...(sid ? { Authorization: `Bearer ${sid}` } : {}) };
  }

  async function pickAndUpload() {
    if (value.length >= maxImages) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Permissão de galeria negada.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: maxImages - value.length,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;

    setUploading(true);
    setError(null);
    const newPaths: string[] = [];
    try {
      for (const asset of result.assets) {
        const name = asset.fileName ?? `screenshot-${Date.now()}.jpg`;
        const contentType = asset.mimeType ?? "image/jpeg";

        const reqRes = await fetch(`${baseUrl}/api/storage/uploads/request-url`, {
          method: "POST",
          headers: await authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ name, contentType }),
        });
        if (!reqRes.ok) throw new Error("Falha ao obter URL de upload");
        const { uploadURL, objectPath } = await reqRes.json();

        const fileRes = await fetch(asset.uri);
        const blob = await fileRes.blob();

        const putRes = await fetch(uploadURL, {
          method: "PUT",
          body: blob,
          headers: { "Content-Type": contentType },
        });
        if (!putRes.ok) throw new Error("Falha ao fazer upload");

        newPaths.push(objectPath);
      }
      onChange([...value, ...newPaths]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  function remove(path: string) {
    onChange(value.filter(p => p !== path));
  }

  return (
    <View>
      <View style={styles.grid}>
        {value.map(path => (
          <View key={path} style={[styles.thumbWrap, { borderColor: colors.border }]}>
            <Image source={{ uri: `${baseUrl}/api/storage${path}` }} style={styles.thumb} />
            <Pressable
              onPress={() => remove(path)}
              style={[styles.removeBtn, { backgroundColor: colors.loss }]}
              hitSlop={8}
            >
              <Feather name="x" size={12} color="#fff" />
            </Pressable>
          </View>
        ))}
        {value.length < maxImages && (
          <Pressable
            onPress={pickAndUpload}
            disabled={uploading}
            style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.muted }]}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <Feather name="camera" size={18} color={colors.primary} />
                <Text style={[styles.addText, { color: colors.mutedForeground }]}>Adicionar</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.loss }]}>{error}</Text>}
      {value.length > 0 && (
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {value.length}/{maxImages} imagens
        </Text>
      )}
    </View>
  );
}

const SIZE = 84;

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: { width: SIZE, height: SIZE, borderRadius: 10, borderWidth: 1, overflow: "hidden", position: "relative" },
  thumb: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: SIZE,
    height: SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addText: { fontFamily: "Inter_500Medium", fontSize: 10 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 8 },
  countText: { fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 8 },
});
