import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/main/DashboardScreen';
import ChatScreen from '../screens/main/ChatScreen';
import StaffListScreen from '../screens/main/StaffListScreen';
import ScheduleScreen from '../screens/main/ScheduleScreen';
import TodoListScreen from '../screens/main/TodoListScreen';
import AnnouncementsScreen from '../screens/main/AnnouncementsScreen';
import ChatbotScreen from '../screens/main/ChatbotScreen';
import LostAndFoundScreen from '../screens/main/LostAndFoundScreen';
import NotesScreen from '../screens/main/NotesScreen';
import PomodoroScreen from '../screens/main/PomodoroScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import { useAuthStore } from '../store/AuthStore';
import CafeteriaMenu from "../screens/main/CafeteriaMenu"; // Assuming you have a CafeteriaMenuScreen
import ContactMessagesScreen from '../screens/main/ContactMessagesScreen'; // Importing the ContactMessagesScreen
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainDrawerNavigator() {
  const { authUser } = useAuthStore();
  const isAdmin = authUser?.role === 'admin';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        drawerActiveTintColor: '#1976d2',
        drawerInactiveTintColor: '#757575',
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Staff List"
        component={StaffListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Todo List"
        component={TodoListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="megaphone-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AI Chatbot"
        component={ChatbotScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="robot-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Lost & Found"
        component={LostAndFoundScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notes"
        component={NotesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Pomodoro"
        component={PomodoroScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="timer-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="calendar-number-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Cafiteria Menu"
        component={CafeteriaMenu}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name='cafe' size={size} color={color} />
          ),
        }}
      />
      {/* {isAdmin && (
        <Drawer.Screen
          name="Sign Up Users"
          component={SignUpScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-add-outline" size={size} color={color} />
            ),
          }}
        />
      )} */}
      {isAdmin && (
        <Drawer.Screen
          name="Contact Messages"
          component={ContactMessagesScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="contrast" size={size} color={color} />
            ),
          }}
        />
      )}
    </Drawer.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* {useAuthStore.getState().clearAuth()} */}
      <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
    </Stack.Navigator>
  );
}

function LogoutScreen() {
  const { clearAuth } = useAuthStore();

  React.useEffect(() => {
    clearAuth();
  }, [clearAuth]);

  return null; // This screen is just for logout, no UI needed
}
// Note: The LogoutScreen is a placeholder to handle logout logic.