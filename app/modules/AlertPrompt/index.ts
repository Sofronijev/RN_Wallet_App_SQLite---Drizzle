import { AlertButton, KeyboardTypeOptions } from "react-native";
import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter"; // eslint-disable-line

// @ts-ignore
export const AlertEmitter = new EventEmitter();

export type PromptOptions = {
  defaultValue?: string;
  keyboardType?: KeyboardTypeOptions;
  placeholder?: string;
};

export type PromptButtons = {
  label: string;
  onPress?: (value?: string) => void;
  type?: 'default' | 'cancel' | 'destructive';
  disabled?: boolean;
};

export type Prompt = {
  title: string;
  message?: string;
  callbackOrButtons?: ((text: string) => void) | PromptButtons[];
  defaultValue: string;
  keyboardType: KeyboardTypeOptions;
  placeholder: string;
};

const prompt = (
  title: string,
  message?: string,
  callbackOrButtons?: ((text: string) => void) | PromptButtons[],
  options?: PromptOptions
) => {
  const { defaultValue = "", keyboardType = "default", placeholder = "" } = options || {};
  AlertEmitter.emit("prompt", {
    title,
    message,
    callbackOrButtons,
    defaultValue,
    keyboardType,
    placeholder,
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
