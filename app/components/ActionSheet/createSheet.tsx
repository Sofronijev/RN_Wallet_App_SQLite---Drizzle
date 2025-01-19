import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";

type CreateSheetReturn<T> = [EventEmitter, (data: T) => void, () => void];

const createSheet = <T,>(): CreateSheetReturn<T> => {
  const Emitter: EventEmitter = new EventEmitter();

  const open = (data: T): void => Emitter.emit("openSheet", data);

  const close = (): void => Emitter.emit("closeSheet");

  return [Emitter, open, close];
};

export default createSheet;
