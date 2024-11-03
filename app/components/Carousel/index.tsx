import {
  FlatList,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useRef } from "react";

// TODO - remove ANY
type CarouselProps<ItemT = any> = {
  data: ArrayLike<ItemT>;
  renderItem: ListRenderItem<ItemT>;
  keyExtractor: (item: ItemT, index: number) => string;
  itemWidth: number;
  itemSpacing?: number;
  style?: StyleProp<ViewStyle>;
  onSnapToItem?: (item: ItemT) => void;
};

const Carousel: React.FC<CarouselProps> = ({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  itemSpacing,
  style,
  onSnapToItem = () => undefined,
}) => {
  const indexRef = useRef(0);

  const { width } = useWindowDimensions();
  const snapInterval = itemWidth + (itemSpacing ?? 0);

  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = event.nativeEvent.contentOffset.x / width;
      const roundIndex = Math.round(index);

      const distance = Math.abs(roundIndex - index);

      // Prevent one pixel triggering setIndex in the middle
      // of the transition. With this we have to scroll a bit
      // more to trigger the index change.
      const isNoMansLand = 0.4 < distance;

      if (roundIndex !== indexRef.current && !isNoMansLand) {
        const selectedItem = data[roundIndex];
        if (selectedItem) {
          onSnapToItem(selectedItem);
        }
        indexRef.current = roundIndex;
      }
    },
    [data]
  );

  const itemSeparator = () => itemSpacing && <View style={{ width: itemSpacing }}></View>;

  const renderItemWidth: ListRenderItem<any> = (data) => {
    const newItem = renderItem(data);
    return <View style={{ width: itemWidth }}>{newItem}</View>;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItemWidth}
      keyExtractor={keyExtractor}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToAlignment='start'
      decelerationRate='fast'
      snapToInterval={snapInterval}
      ItemSeparatorComponent={itemSeparator}
      contentContainerStyle={style}
      onMomentumScrollEnd={onScrollEnd}
    />
  );
};

export default Carousel;
