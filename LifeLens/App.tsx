import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotesScreen from './NotesScreen';
import FoldersScreen from './FoldersScreen';
import NotesInFolderScreen from './NotesInFolderScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const FolderStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Folders" component={FoldersScreen} />
      <Stack.Screen name="NotesInFolder" component={NotesInFolderScreen} />
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Notas" component={NotesScreen} />
        <Tab.Screen name="Carpetas" component={FolderStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
