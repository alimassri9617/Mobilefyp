import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Avatar, IconButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/AuthStore';
import { colors, spacing, typography } from '../../constants/theme';
import { extractTime } from '../../utils/extractTime';

export default function ChatScreen() {
  const token = useAuthStore((state) => state.authUser?.token);
  const userId = useAuthStore((state) => state.authUser?._id);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/messages', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load conversations');

        setConversations(data);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Error', text2: err.message });
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [token]);

  // Fetch messages when conversation selected
  useEffect(() => {
    if (!selectedConversation?._id) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/messages/${selectedConversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load messages');

        setMessages(data);
      } catch (err) {
        Toast.show({ type: 'error', text1: 'Error', text2: err.message });
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/messages/send/${selectedConversation._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: messageText }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setMessages((prev) => [...prev, data]);
      setMessageText('');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message });
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredConversations = conversations.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedConversation?._id === item._id && styles.selectedConversation,
      ]}
      onPress={() => setSelectedConversation(item)}
    >
      <Avatar.Image
        size={50}
        source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
      />
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.conversationRole}>{item.role}</Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.conversationTime}>12:30</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }) => {
    const isMyMessage = item.senderId === userId;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>
          {item.message}
        </Text>
        <Text style={isMyMessage ? styles.myMessageTime : styles.otherMessageTime}>
          {extractTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (!selectedConversation) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {loadingConversations ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item._id}
            ItemSeparatorComponent={() => <Divider />}
          />
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Chat Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedConversation(null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Avatar.Image
          size={40}
          source={{
            uri: selectedConversation.profilePic || 'https://via.placeholder.com/40',
          }}
        />
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>
            {selectedConversation.firstName} {selectedConversation.lastName}
          </Text>
          <Text style={styles.chatHeaderStatus}>Offline</Text>
        </View>
      </View>

      {/* Messages */}
      {loadingMessages ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item._id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />
      )}

      {/* Message Input */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />
        <IconButton
          icon="send"
          size={24}
          iconColor={colors.primary}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || sendingMessage}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 25,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  selectedConversation: {
    backgroundColor: colors.lightGray,
  },
  conversationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  conversationName: {
    ...typography.h6,
    color: colors.text,
  },
  conversationRole: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: spacing.xs,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.md,
  },
  chatHeaderInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  chatHeaderName: {
    ...typography.h6,
    color: colors.text,
  },
  chatHeaderStatus: {
    ...typography.caption,
    color: colors.error,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
  },
  myMessageText: {
    ...typography.body1,
    color: colors.white,
  },
  otherMessageText: {
    ...typography.body1,
    color: colors.text,
  },
  myMessageTime: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.xs,
  },
  otherMessageTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    ...typography.body1,
  },
});
