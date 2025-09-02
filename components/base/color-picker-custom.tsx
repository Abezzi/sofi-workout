import { useSharedValue } from 'react-native-reanimated';
import type { ColorFormatsObject } from 'reanimated-color-picker';
import ColorPicker, { colorKit, HueSlider, Panel1, PreviewText } from 'reanimated-color-picker';
import { View } from 'react-native';
import { useState, useEffect } from 'react';

interface ColorPickerCustomProps {
  onColorSelect: (color: string) => void;
  initialColor?: string;
}

const customSwatches = new Array(6).fill('#fff').map(() => colorKit.randomRgbColor().hex());

export default function ColorPickerCustom({
  onColorSelect,
  initialColor = customSwatches[0],
}: ColorPickerCustomProps) {
  const [resultColor, setResultColor] = useState(initialColor);
  const currentColor = useSharedValue(initialColor);

  useEffect(() => {
    setResultColor(initialColor);
  }, [onColorSelect]);

  const onColorChange = (color: ColorFormatsObject) => {
    'worklet';
    currentColor.value = color.hex;
  };

  const onColorPick = (color: ColorFormatsObject) => {
    setResultColor(color.hex);
    onColorSelect(color.hex);
  };

  return (
    <View style="">
      <ColorPicker
        value={resultColor}
        sliderThickness={25}
        thumbSize={24}
        thumbShape="circle"
        onChange={onColorChange}
        onCompleteJS={onColorPick}>
        <Panel1 />
        <HueSlider />
        <PreviewText />
      </ColorPicker>
    </View>
  );
}
