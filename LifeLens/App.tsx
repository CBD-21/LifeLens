import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotesScreen from './NotesScreen';
import FoldersScreen from './FoldersScreen';
import NotesInFolderScreen from './NotesInFolderScreen';
import { Text } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FolderStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Folders" component={FoldersScreen} />
      <Stack.Screen name="Notas en la carpeta" component={NotesInFolderScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
      <Tab.Screen 
          name="Notas" 
          component={NotesScreen} 
          options={{ tabBarLabel: 'Notas', tabBarIcon: () => (
            <Text style={{ fontSize: 24, marginBottom: 5 }}>📝</Text>
          ) }} 
        />
        <Tab.Screen 
          name="Carpetas" 
          component={FolderStack} 
          options={{ tabBarLabel: 'Carpetas', tabBarIcon: () => (
            <Text style={{ fontSize: 24, marginBottom: 5 }}>📁</Text>
          ) }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
