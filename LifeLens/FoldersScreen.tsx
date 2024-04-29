// FoldersScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import  NotesDatabase  from './NotesScreen'; // Importamos NotesDatabase del componente principal
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    location: 'default',
  },
  () => { },
  error => {
    console.log('Error opening database:', error);
  }
);

class Folders {
  static getAllFolders(callback: (folders: { id: number; name: string }[]) => void) {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM foldersDB', [], (_, { rows }) => {
        const folders = [];
        for (let i = 0; i < rows.length; i++) {
          folders.push(rows.item(i));
        }
        callback(folders);
      });
    });
  }
}



const FoldersScreen = () => {
  const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);

  

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = () => {
    Folders.getAllFolders((folders) => {
      setFolders(folders);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Carpetas</Text>
      <FlatList
        data={folders}
        renderItem={({ item }) => (
          <View style={styles.folderItem}>
            <Text style={styles.folderName}>{item.name}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  folderItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  folderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FoldersScreen
