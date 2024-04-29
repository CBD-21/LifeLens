import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotesScreen from './NotesScreen';
import FoldersScreen from './FoldersScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Notas" component={NotesScreen} />
        <Tab.Screen name="Carpetas" component={FoldersScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;