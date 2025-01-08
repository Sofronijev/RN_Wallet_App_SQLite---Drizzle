import { Keyboard, Platform, View } from "react-native";
import React, { useEffect, useState } from "react";
import Dialog from "react-native-dialog";
import { AlertEmitter, Prompt, PromptButtons } from "./index";
import colors from "constants/colors";

const initialState: Prompt = {
  title: "",
  message: "",
  callbackOrButtons: undefined,
  defaultValue: "",
  keyboardType: "default",
  placeholder: "",
  validator: () => true,
};
// TODO - ADD validation to prompt typing

const AlertPrompt: React.FC = () => {
  const [data, setData] = useState<Prompt>(initialState);
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);

  const close = () => {
    Keyboard.dismiss();
    setVisible(false);
  };

  useEffect(() => {
    AlertEmitter.addListener("prompt", (config: Prompt) => {
      setVisible(true);
      setValue(config.defaultValue ?? "");
      setData(config);
    });

    AlertEmitter.addListener("dismiss", () => {
      close();
    });

    return () => {
      AlertEmitter.removeAllListeners();
    };
  }, []);

  const isDefaultUI = () => {
    const { callbackOrButtons } = data;
    return (
      callbackOrButtons === null ||
      callbackOrButtons === undefined ||
      typeof callbackOrButtons === "function"
    );
  };

  const isValid = !!value && data.validator(value);

  const buttonColor = !isValid ? colors.disabled : undefined;

  const onSave = () => {
    if (typeof data.callbackOrButtons === "function") {
      data.callbackOrButtons(value);
    }
    close();
  };

  const onButtonPress = (index: number) => {
    const { callbackOrButtons } = data;
    if (Array.isArray(callbackOrButtons)) {
      const { onPress } = callbackOrButtons[index];
      if (onPress && typeof onPress === "function") {
        onPress(value);
      }
    }
    close();
  };

  const renderButtons = () => {
    if (data.callbackOrButtons) {
      if (typeof data.callbackOrButtons === "function") {
        return (
          <Dialog.Button label='OK' onPress={onSave} disabled={!isValid} color={buttonColor} />
        );
      }

      if (Array.isArray(data.callbackOrButtons)) {
        return data.callbackOrButtons.map((button, index) => {
          const color =
            button.type === "destructive" && Platform.OS === "ios" ? colors.delete : buttonColor;
          const bold = Platform.OS === "ios" && button.type === "cancel";
          const disabled = button.type === "cancel" && (button.disabled || !isValid);
          return (
            <Dialog.Button
              key={index}
              label={button.label}
              onPress={() => onButtonPress(index)}
              disabled={disabled}
              color={color}
              bold={bold}
            />
          );
        });
      }
    }
    return <Dialog.Button label='OK' onPress={close} />;
  };

  const onChangeText = (text: string) => {
    setValue(text);
  };

  const onSubmitEditing = () => {
    if (!isValid) return;
    if (isDefaultUI()) {
      onSave();
    }
    if (Array.isArray(data.callbackOrButtons)) {
      const defaultPredicate = (button: PromptButtons) => button.type === "default";
      const buttons = data.callbackOrButtons.filter(defaultPredicate);
      const index = data.callbackOrButtons.findIndex(defaultPredicate);
      if (buttons.length === 1 && index >= 0) onButtonPress(index);
    }
  };

  return (
    <View>
      <Dialog.Container visible={visible}>
        <Dialog.Title>{data.title}</Dialog.Title>
        <Dialog.Description>{data.message}</Dialog.Description>
        <Dialog.Input
          value={value}
          placeholder={data.defaultValue}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          autoFocus
          underlineColorAndroid={colors.grey}
          keyboardType={data.keyboardType}
        />
        {isDefaultUI() && (
          <Dialog.Button label='Cancel' onPress={close} bold={Platform.OS === "ios"} />
        )}
        {renderButtons()}
      </Dialog.Container>
    </View>
  );
};

export default AlertPrompt;
