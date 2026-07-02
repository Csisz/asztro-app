import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PulsingLoader } from '@/components/pulsing-loader';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useProfile } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { hu } from '@/i18n/hu';
import { getChineseSign } from '@/lib/chineseZodiac';
import { getWesternSign } from '@/lib/westernZodiac';
import { aiService, type ChatMessage } from '@/services/ai';

const MAX_ROUNDS = 10;

export default function OracleScreen() {
  const { profile } = useProfile();
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  if (!profile) {
    return null;
  }

  const birthDate = new Date(profile.birthDate);
  const westernSign = getWesternSign(birthDate);
  const chineseSign = getChineseSign(birthDate);
  const greeting = `Üdvözöllek, ${profile.name}! Érzem benned a ${westernSign.nameHu} erejét és a ${chineseSign.animalNameHu} bölcsességét. Mit szeretnél kérdezni a csillagoktól?`;

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isSending || isClosed) {
      return;
    }

    const history = messages;
    setMessages([...history, { role: 'user', content: question }]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await aiService.askOracle(profile, question, history);
      const roundCount = history.filter((message) => message.role === 'user').length + 1;
      const nextMessages: ChatMessage[] = [
        ...history,
        { role: 'user', content: question },
        { role: 'assistant', content: reply },
      ];

      if (roundCount >= MAX_ROUNDS) {
        nextMessages.push({ role: 'assistant', content: hu.oracle.closingMessage });
        setIsClosed(true);
      }

      setMessages(nextMessages);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
          <ThemedText type="subtitle" style={styles.heading}>
            {hu.oracle.title}
          </ThemedText>

          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
            <ThemedView type="backgroundElement" style={[styles.bubble, styles.bubbleAssistant]}>
              <ThemedText>{greeting}</ThemedText>
            </ThemedView>

            {messages.map((message, index) => (
              <ThemedView
                key={index}
                type={message.role === 'user' ? 'backgroundSelected' : 'backgroundElement'}
                style={[styles.bubble, message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                <ThemedText>{message.content}</ThemedText>
              </ThemedView>
            ))}

            {isSending && <PulsingLoader label={hu.oracle.thinking} />}
          </ScrollView>

          {!isClosed && (
            <ThemedView style={styles.inputRow}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={hu.oracle.inputPlaceholder}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                editable={!isSending}
                onSubmitEditing={handleSend}
                returnKeyType="send"
              />
              <Pressable
                onPress={handleSend}
                disabled={isSending || !input.trim()}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="primary" style={styles.sendButton}>
                  <ThemedText type="smallBold" style={styles.sendButtonText}>
                    {hu.oracle.sendButton}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </ThemedView>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  heading: {
    textAlign: 'center',
    paddingVertical: Spacing.two,
  },
  messagesContainer: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
  },
  bubbleUser: {
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  sendButtonText: {
    color: '#241A45',
  },
  pressed: {
    opacity: 0.7,
  },
});
