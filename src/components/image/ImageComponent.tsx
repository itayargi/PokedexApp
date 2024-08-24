import React, { useState, useEffect } from "react";
import { Image, Text } from "react-native";

const ImageComponent = ({ name }: { name: string }) => {
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
    return <Text>Loading...</Text>;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={{ width: 60, height: 60, marginHorizontal: 10 }}
    />
  );
};

export default ImageComponent;
