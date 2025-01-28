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

type CarouselProps<ItemT> = {
  data: ItemT[];
  renderItem: ListRenderItem<ItemT>;
  keyExtractor: (item: ItemT, index: number) => string;
  itemWidth: number;
  itemSpacing?: number;
  style?: StyleProp<ViewStyle>;
  onSnapToItem?: (item: ItemT) => void;
  initialIndex?: number;
};

const Carousel = <ItemT,>({
  data,
  renderItem,
  keyExtractor,
  itemWidth,
  itemSpacing,
  style,
  onSnapToItem = () => undefined,
  initialIndex,
}: CarouselProps<ItemT>) => {
  // NOTE: indexRef can be undefined on the initial render
  const indexRef = useRef(initialIndex);
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
    [data, initialIndex]
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
      bounces={false}
      alwaysBounceHorizontal={false}
      overScrollMode='never'
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({
        length: snapInterval,
        offset: snapInterval * index,
        index,
      })}
    />
  );
};

export default Carousel;
