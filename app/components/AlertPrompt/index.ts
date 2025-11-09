import { AlertButton, KeyboardTypeOptions, NativeEventEmitter } from "react-native";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter"; // eslint-disable-line

// @ts-ignore
export const AlertEmitter = new EventEmitter();

export type PromptOptions = {
  defaultValue?: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
  validator?: (text: string) => boolean;
};

export type PromptButtons = {
  label: string;
  onPress?: (value?: string) => void;
  type?: "default" | "cancel" | "destructive";
  disabled?: boolean;
};

export type Prompt = {
  title: string;
  message?: string;
  callbackOrButtons?: ((text: string) => void) | PromptButtons[];
  defaultValue: string;
  keyboardType: KeyboardTypeOptions;
  placeholder: string;
  validator: (text: string) => boolean;
};

const prompt = (
  title: string,
  message?: string | null,
  callbackOrButtons?: ((text: string) => void) | PromptButtons[],
  options?: PromptOptions
) => {
  const {
    defaultValue = "",
    keyboardType = "default",
    placeholder = "",
    validator = () => true,
  } = options || {};
  AlertEmitter.emit("prompt", {
    title,
    message,
    callbackOrButtons,
    defaultValue,
    keyboardType,
    placeholder,
    validator,
  });
};

const dismiss = () => {
  AlertEmitter.emit("dismiss");
};

const AlertPrompt = {
  prompt,
  dismiss,
};

export default AlertPrompt;
