import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { MutableRefObject, useCallback, useEffect, useState } from "react";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

const useSheetData = <T,>(
  emitter: EventEmitter,
  sheetRef: MutableRefObject<BottomSheetModal | undefined | null>
): T | undefined => {
  const [data, setData] = useState<T | undefined>();

  const openSheet = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
  }, []);

  useEffect(() => {
    emitter.addListener("openSheet", (config: T) => {
      setData(config);
      openSheet();
    });

    emitter.addListener("closeSheet", () => {
      setData(undefined);
      closeSheet();
    });

    return () => {
      emitter.removeAllListeners();
    };
  }, []);

  return data;
};

export default useSheetData;
