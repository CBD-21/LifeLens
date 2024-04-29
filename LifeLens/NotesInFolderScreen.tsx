import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase(
  {
    name: 'notesDB.db',
    location: 'default',
  },
  () => {},
  error => {
    console.log('Error opening database:', error);
  }
);

// Definir el tipo de ruta para NotesInFolderScreen
type NotesInFolderScreenRouteProp = RouteProp<{ NotesInFolderScreen: { folderId: number } }, 'NotesInFolderScreen'>;

// Definir el tipo de cada elemento en el array de notas
type Note = {
  id: number;
  title: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  // Añade más propiedades si es necesario
};

const NotesInFolderScreen = ({ route }: { route: NotesInFolderScreenRouteProp }) => {
  const { folderId } = route.params;
  const [notes, setNotes] = useState<Note[]>([]); // Especificar el tipo de notes como Note[]

  useEffect(() => {
    fetchNotesInFolder();
  }, []);

  const fetchNotesInFolder = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM notesDB WHERE folder_id = ?', [folderId], (_, { rows }) => {
        const notesArray: Note[] = [];
        for (let i = 0; i < rows.length; i++) {
          notesArray.push(rows.item(i)); // Asegúrate de que rows.item(i) tenga el tipo Note
        }
        setNotes(notesArray);
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notas en la carpeta:</Text>
      <FlatList
        data={notes}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteTitle}>Titulo: {item.title}</Text>
            <Text>Descripción: {item.description}</Text>
            <Text>Prioridad: {item.priority}</Text>
            <Text>Estado: {item.status}</Text>
            <Text>Fecha de Creación: {item.created_at}</Text>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
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
  noteItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  noteTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default NotesInFolderScreen;
