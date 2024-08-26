import React, { useState, useEffect, memo } from "react";
import { Image, ImageStyle, StyleProp, Text, View } from "react-native";

const ImageComponent = ({ name, style }: { name: string, style?:StyleProp<ImageStyle> }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const response = await fetch(`http://localhost:8080/icon/${name.toLowerCase()}`);
        const url = await response.text();
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
      }
    };

    fetchImageUrl();
  }, [name]);

  if (!imageUrl) {
    return <View style={{width:60, height:60}} />
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[{ width: 60, height: 60, marginHorizontal: 10 }, style]}
    />
  );
};

export default memo(ImageComponent);
